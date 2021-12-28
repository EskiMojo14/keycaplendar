import firebase from "firebase/app";
/* eslint-disable import/no-duplicates */
//import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
/* eslint-enable import/no-duplicates */

const firebaseConfig = {
  apiKey: "AIzaSyA2gQez-yGoqRpI-G8kqB5CvusDvDyFiy4",
  authDomain: "keycaplendar.firebaseapp.com",
  databaseURL: "https://keycaplendar.firebaseio.com",
  projectId: "keycaplendar",
  storageBucket: "keycaplendar.appspot.com",
  messagingSenderId: "422111576432",
  appId: "1:422111576432:web:35088aee2889ffc2b60fb5",
  //measurementId: "G-DTG7KB21BQ",
};
// Initialize Firebase
// eslint-disable-next-line import/no-named-as-default-member
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line import/no-named-as-default-member
  firebase.functions().useEmulator("localhost", 5001);
}

export default firebase;
