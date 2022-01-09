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
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }
  const listUsers = async (nextPageToken: string) => {
    const processResult = (result: admin.auth.ListUsersResult) => {
      const users = result.users.map((user) => {
        const dateCreated = DateTime.fromHTTP(
          user.metadata.creationTime
        ).toISO();
        const lastSignIn = DateTime.fromHTTP(
          user.metadata.lastSignInTime
        ).toISO();
        const lastActive = user.metadata.lastRefreshTime
          ? DateTime.fromHTTP(user.metadata.lastRefreshTime).toISO()
          : "";
        if (user.customClaims) {
          return {
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: user.customClaims.nickname ?? "",
            designer: user.customClaims.designer ?? false,
            editor: user.customClaims.editor ?? false,
            admin: user.customClaims.admin ?? false,
            dateCreated: dateCreated,
            lastSignIn: lastSignIn,
            lastActive: lastActive,
          };
        } else {
          return {
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: "",
            designer: false,
            editor: false,
            admin: false,
            dateCreated: dateCreated,
            lastSignIn: lastSignIn,
            lastActive: lastActive,
          };
        }
      });
      return { users: users, nextPageToken: result.pageToken };
    };
    if (nextPageToken) {
      const result = await admin
        .auth()
        .listUsers(data.length, nextPageToken)
        .then((result) => processResult(result))
        .catch((error) => {
          return { error: "Error listing users: " + error };
        });
      return result;
    } else {
      const result = await admin
        .auth()
        .listUsers(data.length)
        .then((result) => processResult(result))
        .catch((error) => {
          return { error: "Error listing users: " + error };
        });
      return result;
    }
  };
  // List batch of users, 1000 at a time.
  const result = await listUsers(data.nextPageToken);
  return result;
});

/**
 * Deletes specified user if current user is admin.
 */

export const deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }
  if (data.email === functions.config().admin.email) {
    return {
      error: "This user cannot be deleted",
    };
  }
  const currentUser = await admin.auth().getUser(context.auth.uid);
  const user = await admin.auth().getUserByEmail(data.email);
  admin
    .auth()
    .deleteUser(user.uid)
    .then(() => {
      console.log(
        currentUser.displayName +
          " successfully deleted account of " +
          user.displayName +
          "."
      );
      return null;
    })
    .catch((error) => {
      return { error: "Error deleting user: " + error };
    });

  admin
    .firestore()
    .collection("users")
    .doc(user.uid as UserId)
    .delete()
    .then(() => {
      console.log("Deleted user preference file for " + user.displayName + ".");
      return null;
    })
    .catch((error) => {
      console.log("Failed to delete user preference file:" + error);
    });
  return "Success";
});

/**
 * Sets custom claims to specified values if current user is admin.
 */

export const setRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "User not admin.",
    };
  }
  const currentUser = await admin.auth().getUser(context.auth.uid);
  const user = await admin.auth().getUserByEmail(data.email);
  const claims = {
    designer: data.designer,
    nickname: data.nickname,
    editor: data.editor,
    admin: data.admin,
  };
  await admin
    .auth()
    .setCustomUserClaims(user.uid, claims)
    .then(() => {
      console.log(
        `${currentUser.displayName} successfully edited account of ${user.displayName}. Designer: ${data.designer}, editor: ${data.editor}, admin: ${data.admin}, nickname: ${data.nickname}`
      );
      return null;
    })
    .catch((error) => {
      return { error: "Error setting roles: " + error };
    });
  const newUser = await admin.auth().getUserByEmail(data.email);
  return newUser.customClaims;
});

/**
 * Deletes own user and preference file.
 */

export const deleteOwnUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return {
      error: "No current user signed in.",
    };
  }
  const [currentUser, userErr] = await handle<admin.auth.UserRecord>(
    admin.auth().getUser(context.auth.uid)
  );
  if (userErr) {
    return {
      error: userErr.errorInfo.message,
    };
  }
  if (currentUser) {
    if (currentUser.email === functions.config().admin.email) {
      return {
        error: "This user cannot be deleted.",
      };
    }
    const deleteUser = admin
      .auth()
      .deleteUser(currentUser.uid)
      .then(() => {
        console.log(
          currentUser.displayName + " successfully deleted own account."
        );
        return null;
      })
      .catch((error) => {
        console.log(
          "Error deleting user " + currentUser.displayName + ": " + error
        );
        return { error: "Error deleting user: " + error };
      });
    const deleteFile = admin
      .firestore()
      .collection("users")
      .doc(currentUser.uid as UserId)
      .delete()
      .then(() => {
        console.log(
          "Deleted user preference file for " + currentUser.displayName + "."
        );
        return null;
      })
      .catch((error) => {
        console.log("Failed to delete user preference file: " + error);
        return { error: "Failed to delete user preference file: " + error };
      });
    return Promise.all([deleteUser, deleteFile]);
  } else {
    return {
      error: "Unknown error.",
    };
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
