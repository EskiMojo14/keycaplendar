import firebase from ".";
import type { Firestore } from "typed-firestore";
import type { FirestoreType } from "./types";

export const typedFirestore = (firebase.firestore() as unknown) as Firestore<FirestoreType>;
