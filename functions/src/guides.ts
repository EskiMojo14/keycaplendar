import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { alphabeticalSortProp } from "./util/functions";
import { GuideEntryType } from "./util/types";

const db = admin.firestore();

/**
 * Filters guides based on user custom claims and guide visibility.
 */

export const getGuides = functions.https.onCall((data, context) => {
  let designer = false;
  let editor = false;
  let admin = false;
  if (context.auth) {
    const { designer: isDesigner, editor: isEditor, admin: isAdmin } = context.auth.token;
    designer = Boolean(isDesigner);
    editor = Boolean(isEditor);
    admin = Boolean(isAdmin);
  }
  return db
    .collection("guides")
    .get()
    .then((querySnapshot) => {
      const entries: GuideEntryType[] = [];
      querySnapshot.forEach((doc) => {
        const { visibility, ...data } = doc.data() as Omit<GuideEntryType, "id">;
        const entry: GuideEntryType = {
          ...data,
          visibility,
          id: doc.id,
        };
        const showEntryBool =
          visibility === "all" ||
          (visibility === "designer" && (designer || editor || admin)) ||
          (visibility === "editor" && (editor || admin)) ||
          (visibility === "admin" && admin);
        if (showEntryBool) {
          entries.push(entry);
        }
      });

      alphabeticalSortProp(entries, "title", true);
      return Promise.resolve(entries);
    });
});
