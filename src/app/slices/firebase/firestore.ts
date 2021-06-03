import firebase from "../../../firebase";
import { Firestore } from "typed-firestore";
import { FirestoreType } from "./types";

export const typedFirestore = (firebase.firestore() as unknown) as Firestore<FirestoreType>;
