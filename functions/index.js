
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const app = admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.isEditor = functions.https.onCall((data, context) => {
  if (context.auth && (context.auth.token.editor === true)) {
    return true;
  }
  return false;
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
