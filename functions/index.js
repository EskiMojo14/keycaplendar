const admin = require("firebase-admin");
const functions = require("firebase-functions");

const app = admin.initializeApp();

const db = admin.firestore();

exports.getClaims = functions.https.onCall((data, context) => {
  if (context.auth) {
    return {
      nickname: context.auth.token.nickname ? context.auth.token.nickname : "",
      designer: context.auth.token.designer ? context.auth.token.designer : false,
      editor: context.auth.token.editor ? context.auth.token.editor : false,
      admin: context.auth.token.admin ? context.auth.token.admin : false,
      id: context.auth.uid,
    };
  }
  return {
    nickname: "",
    designer: false,
    editor: false,
    admin: false,
    id: null,
  };
});

exports.onKeysetUpdate = functions.firestore.document("keysets/{keysetId}").onWrite(async (change, context) => {
  if (!change.before.data()) {
    console.log("Document created")
  }
  if (change.after.data() && change.after.data().latestEditor) {
    const user = await admin.auth().getUser(change.after.data().latestEditor);
    db.collection("changelog")
      .add({
        documentId: context.params.keysetId,
        before: (change.before.data() ? change.before.data() : null),
        after: (change.after.data() ? change.after.data() : null),
        timestamp: context.timestamp,
        user: {
          displayName: user.displayName,
          email: user.email,
          nickname: user.customClaims.nickname
        }
      })
      .then((docRef) => {
        console.log("Changelog written with ID: ", docRef.id);
        return null;
      })
      .catch((error) => {
        console.error("Error adding changelog: ", error);
        return null;
      });
  } else {
    console.error("No user ID attached to action.");
  }
  if (change.after.data() && !change.after.data().profile) {
    console.log("Document deleted")
    db.collection("keysets").doc(context.params.keysetId).delete().then(() => {
      console.error("Removed document " + context.params.keysetId + ".")
      return null;
    }).catch((error) => {
      console.error("Error removing document " + context.params.keysetId + ": " + error)
      return null;
    })
  }
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
