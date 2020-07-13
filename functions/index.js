const admin = require("firebase-admin");
const functions = require("firebase-functions");

const app = admin.initializeApp();

exports.getClaims = functions.https.onCall((data, context) => {
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

exports.listUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }
  // List batch of users, 1000 at a time.
  const users = await admin
    .auth()
    .listUsers(1000)
    .then((result) => {
      const newArray = result.users.map((user) => {
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
      return newArray;
    })
    .catch((error) => {
      return { error: "Error listing users: " + error };
    });
  return users;
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
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
  return "Success";
});

exports.setRoles = functions.https.onCall(async (data, context) => {
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
        currentUser.displayName +
          " successfully edited account of " +
          user.displayName +
          ". Designer: " +
          data.designer +
          ", editor: " +
          data.editor +
          ", admin: " +
          data.admin +
          ", nickname: " +
          data.nickname
      );
      return null;
    })
    .catch((error) => {
      return { error: "Error setting roles: " + error };
    });
  const newUser = await admin.auth().getUserByEmail(data.email);
  return newUser.customClaims;
});
