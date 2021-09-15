/* eslint-disable promise/no-nesting */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { nanoid } from "nanoid";

export const generateAliases = functions.https.onCall((data, context) => {
  return admin
    .firestore()
    .collection("keysets")
    .get()
    .then((querySnapshot) => {
      const promises: Promise<any>[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().alias) {
          promises.push(Promise.resolve());
        } else {
          const setPromise = admin
            .firestore()
            .collection("keysets")
            .doc(doc.id)
            .set({ alias: nanoid(10) }, { merge: true });
          setPromise
            .then(() => {
              return console.log("Generated alias for id:" + doc.id);
            })
            .catch((error) => {
              console.log("Failed to generate alias:" + error);
            });
          promises.push(setPromise);
        }
      });
      return Promise.all(promises);
    })
    .catch((error) => {
      console.log("Failed to generate alias:" + error);
    });
});
