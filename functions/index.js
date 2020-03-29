
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const app = admin.initializeApp();

exports.isEditor = functions.https.onCall((data, context) => {
  if (context.auth && (context.auth.token.editor === true)) {
    return true;
  }
  return false;
});

exports.isAdmin = functions.https.onCall((data, context) => {
  if (context.auth && (context.auth.token.admin === true)) {
    return true;
  }
  return false;
});

exports.currentUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "User not admin."
    }
  }
  if (context.auth) {
    const user = await admin.auth().getUser(context.auth.uid);
    if (user.customClaims) {
      return user.customClaims;
    }
    return "No custom claims";
  }
  return "No user";
});

exports.listUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "User not admin."
    }
  }
  // List batch of users, 1000 at a time.
  const users = await admin.auth().listUsers(1000)
    .then((result) => {
      const newArray = result.users.map((user) => {
        if (user.customClaims) {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            editor: (user.customClaims.editor ? true : false),
            admin: (user.customClaims.admin ? true : false )
          };
        } else {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            editor: false,
            admin: false
          };
        }
      })
      return newArray;
    })
    .catch((error) => {
      return { error: 'Error listing users: ' + error };
    });
  return users;
});

exports.grantRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "User not admin."
    }
  }
  const user = await admin.auth().getUserByEmail(data.email);
  if (user.customClaims && user.customClaims[data.role] === true) {
    return user.customClaims;
  } else {
    let claims = (user.customClaims ? user.customClaims : {});
    claims[data.role] = true;
    await admin.auth().setCustomUserClaims(user.uid, claims);
    const newUser = await admin.auth().getUserByEmail(data.email);
    return newUser.customClaims;
  }
});
