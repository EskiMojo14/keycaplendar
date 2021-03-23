// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as admin from "firebase-admin";

admin.initializeApp();

import * as api from "./api";
import * as audit from "./audit";
import * as thumbs from "./thumbs";
import * as users from "./users";

// api

exports.apiAuth = api.apiAuth;

exports.getAllKeysets = api.getAllKeysets;

exports.getKeysetById = api.getKeysetById;

// audit

exports.onKeysetUpdate = audit.onKeysetUpdate;

// thumbs

exports.createThumbs = thumbs.createThumbs;

exports.createThumbsAuto = thumbs.createThumbsAuto;

// users

exports.getClaims = users.getClaims;

exports.listUsers = users.listUsers;

exports.deleteUser = users.deleteUser;

exports.setRoles = users.setRoles;
