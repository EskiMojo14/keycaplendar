import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

/**
 * Returns custom claims for current user.
 */

export const getClaims = functions.https.onCall((data, context) => {
  if (context.auth) {
    return {
      nickname: context.auth.token.nickname ? context.auth.token.nickname : "",
      designer: context.auth.token.designer ? context.auth.token.designer : false,
      editor: context.auth.token.editor ? context.auth.token.editor : false,
      admin: context.auth.token.admin ? context.auth.token.admin : false,
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
        if (user.customClaims) {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: user.customClaims.nickname ? user.customClaims.nickname : "",
            designer: user.customClaims.designer ? true : false,
            editor: user.customClaims.editor ? true : false,
            admin: user.customClaims.admin ? true : false,
          };
        } else {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: "",
            designer: false,
            editor: false,
            admin: false,
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
  if (data.email === "ben.j.durrant@gmail.com") {
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
      console.log(currentUser.displayName + " successfully deleted account of " + user.displayName + ".");
      return null;
    })
    .catch((error) => {
      return { error: "Error deleting user: " + error };
    });

  db.collection("users")
    .doc(user.uid)
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
