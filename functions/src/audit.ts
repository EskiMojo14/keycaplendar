import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

/**
 * Creates audit log entry upon keyset change. Additionally, deletes document if it's "empty".
 */

export const onKeysetUpdate = functions.firestore.document("keysets/{keysetId}").onWrite(async (change, context) => {
  if (!change.before.data()) {
    console.log("Document created");
  }
  const afterData = change.after.data();
  if (afterData && afterData.latestEditor) {
    const user = await admin.auth().getUser(afterData.latestEditor);
    db.collection("changelog")
      .add({
        documentId: context.params.keysetId,
        before: change.before.data() ? change.before.data() : null,
        after: change.after.data() ? change.after.data() : null,
        timestamp: context.timestamp,
        user: {
          displayName: user.displayName,
          email: user.email,
          nickname: user.customClaims ? user.customClaims.nickname : "",
        },
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
  if (afterData && !afterData.profile) {
    console.log("Document deleted");
    db.collection("keysets")
      .doc(context.params.keysetId)
      .delete()
      .then(() => {
        console.error("Removed document " + context.params.keysetId + ".");
        return null;
      })
      .catch((error) => {
        console.error("Error removing document " + context.params.keysetId + ": " + error);
        return null;
      });
  }
});
