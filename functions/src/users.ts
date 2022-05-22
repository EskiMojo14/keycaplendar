import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { UserId } from "./slices/firebase/types";
import { DateTime } from "luxon";
import { handle } from "./slices/common/functions";

/**
 * Returns custom claims for current user.
 */

export const getClaims = functions.https.onCall((data, context) => {
  if (context.auth) {
    return {
      nickname: context.auth.token.nickname ?? "",
      designer: context.auth.token.designer ?? false,
      editor: context.auth.token.editor ?? false,
      admin: context.auth.token.admin ?? false,
    };
  }
  return {
    nickname: "",
    designer: false,
    editor: false,
    admin: false,
  };
});

/**
 * Lists all users if current user is admin.
 */

export const listUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Current user is not an admin. Access is not permitted."
    );
  }
  const processResult = (result: admin.auth.ListUsersResult) => {
    return {
      users: result.users.map((user) => {
        const dateCreated = DateTime.fromHTTP(
          user.metadata.creationTime
        ).toISO();
        const lastSignIn = DateTime.fromHTTP(
          user.metadata.lastSignInTime
        ).toISO();
        const lastActive = user.metadata.lastRefreshTime
          ? DateTime.fromHTTP(user.metadata.lastRefreshTime).toISO()
          : "";
        return {
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          nickname:
            user.customClaims && user.customClaims.nickname // TODO: work out why optional chaining doesn't get compiled to something that works
              ? user.customClaims.nickname
              : "",
          designer:
            user.customClaims && user.customClaims.designer
              ? user.customClaims.designer
              : false,
          editor:
            user.customClaims && user.customClaims.editor
              ? user.customClaims.editor
              : false,
          admin:
            user.customClaims && user.customClaims.admin
              ? user.customClaims.admin
              : false,
          dateCreated: dateCreated,
          lastSignIn: lastSignIn,
          lastActive: lastActive,
        };
      }),
      nextPageToken: result.pageToken,
    };
  };
  try {
    return await admin
      .auth()
      .listUsers(data.length, data.nextPageToken ?? undefined)
      .then((result) => processResult(result));
  } catch (error) {
    throw new functions.https.HttpsError(
      "unknown",
      "Error listing users",
      error
    );
  }
});

/**
 * Deletes specified user if current user is admin.
 */

export const deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Current user is not an admin. Access is not permitted."
    );
  }
  if (data.email === functions.config().admin.email) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "This user cannot be deleted"
    );
  }
  try {
    const [currentUser, currentUserErr] = await handle(
      admin.auth().getUser(context.auth.uid)
    );
    if (currentUserErr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User not found",
        currentUserErr
      );
    }

    const [user, userErr] = await handle(
      admin.auth().getUserByEmail(data.email)
    );
    if (userErr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User not found",
        userErr
      );
    }
    const results = await Promise.all([
      await admin
        .auth()
        .deleteUser(user!.uid)
        .then(() =>
          console.log(
            currentUser!.displayName +
              " successfully deleted account of " +
              user!.displayName +
              "."
          )
        )
        .catch(
          (error) =>
            new functions.https.HttpsError(
              "unknown",
              "Error deleting user",
              error
            )
        ),
      await admin
        .firestore()
        .collection("users")
        .doc(user!.uid as UserId)
        .delete()
        .then(() =>
          console.log(
            "Deleted user preference file for " + user!.displayName + "."
          )
        )
        .catch(
          (error) =>
            new functions.https.HttpsError(
              "unknown",
              "Failed to delete user preference file",
              error
            )
        ),
    ]);
    for (const result of results) {
      if (result instanceof functions.https.HttpsError) {
        throw result;
      }
    }
    return "Success";
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError(
        "unknown",
        "Something went wrong",
        error
      );
    }
  }
});

/**
 * Sets custom claims to specified values if current user is admin.
 */

export const setRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Current user is not an admin. Access is not permitted."
    );
  }
  const { id, ...claims } = data;
  try {
    const [currentUser, currentUserErr] = await handle(
      admin.auth().getUser(context.auth.uid)
    );
    if (currentUserErr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Current user not found",
        currentUserErr
      );
    }

    const [user, userErr] = await handle(admin.auth().getUser(id));
    if (userErr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User not found",
        userErr
      );
    }
    await admin.auth().setCustomUserClaims(user!.uid, claims);
    console.log(
      `${currentUser!.displayName} successfully edited account of ${
        user!.displayName
      }. Designer: ${data.designer}, editor: ${data.editor}, admin: ${
        data.admin
      }, nickname: ${data.nickname}`
    );
    const [newUser, newUserErr] = await handle(admin.auth().getUser(id));
    if (newUserErr) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User not found",
        newUserErr
      );
    }
    return newUser!.customClaims;
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError(
        "unknown",
        "Something went wrong",
        error
      );
    }
  }
});

/**
 * Deletes own user and preference file.
 */

export const deleteOwnUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "No current user signed in."
    );
  }
  const [currentUser, userErr] = await handle<admin.auth.UserRecord>(
    admin.auth().getUser(context.auth.uid)
  );
  if (userErr) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Current user not found",
      userErr
    );
  }
  if (currentUser!.email === functions.config().admin.email) {
    if (data.email === functions.config().admin.email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "This user cannot be deleted"
      );
    }
  }
  const results = await Promise.all([
    await admin
      .auth()
      .deleteUser(currentUser!.uid)
      .then(() =>
        console.log(
          currentUser!.displayName + " successfully deleted own account."
        )
      )
      .catch(
        (error) =>
          new functions.https.HttpsError(
            "unknown",
            "Error deleting user",
            error
          )
      ),
    await admin
      .firestore()
      .collection("users")
      .doc(currentUser!.uid as UserId)
      .delete()
      .then(() =>
        console.log(
          "Deleted user preference file for " + currentUser!.displayName + "."
        )
      )
      .catch(
        (error) =>
          new functions.https.HttpsError(
            "unknown",
            "Failed to delete user preference file",
            error
          )
      ),
  ]);
  for (const result of results) {
    if (result instanceof functions.https.HttpsError) {
      throw result;
    }
  }
});

/** Returns a list of keyset IDs if the provided ID matches with a favoritesId in a user doc. */

export const getFavorites = functions.https.onCall(async (data, context) => {
  if (!data.id) {
    return Promise.reject(Error("No ID provided."));
  }
  return admin
    .firestore()
    .collection("users")
    .where("favoritesId", "==", data.id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return Promise.reject(Error("No favorites with this ID"));
      } else {
        const favorites: {
          array: string[];
          displayName: string;
        } = {
          array: [],
          displayName: "",
        };
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.favorites) {
            favorites.array = data.favorites;
            if (data.shareName) {
              favorites.displayName = data.shareName;
            }
          }
        });
        return Promise.resolve(favorites);
      }
    })
    .catch((error) => {
      console.log(error);
      return Promise.reject(Error(error));
    });
});
