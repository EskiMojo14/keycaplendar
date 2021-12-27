import type { Firestore } from "typed-firestore";
import firebase from ".";
import type { FirestoreType } from "./types";

export const typedFirestore = (firebase.firestore() as unknown) as Firestore<FirestoreType>;

export default typedFirestore;
