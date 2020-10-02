import firebase from "firebase/app";
//import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";

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
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

export default firebase;
