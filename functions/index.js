const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.isEditor = functions.https.onCall((data, context) => {
  if (context.auth) {
    //return context.auth.uid;
    return true;
  }
  return false;
});
