import * as admin from "firebase-admin";
import type { Firestore } from "typed-admin-firestore";
import type { FirestoreType } from "./types";

export const typedFirestore =
  admin.firestore() as unknown as Firestore<FirestoreType>;
