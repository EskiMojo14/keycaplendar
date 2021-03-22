// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export {};

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Storage } from "@google-cloud/storage";
import * as path from "path";
import * as sharp from "sharp";
import * as jwt from "jsonwebtoken";

admin.initializeApp();

const db = admin.firestore();

const storage = new Storage();

const runtimeOpts: {
  timeoutSeconds: number;
  memory: "2GB";
} = {
  timeoutSeconds: 540,
  memory: "2GB",
};

exports.createThumbsAuto = functions
  .runWith(runtimeOpts)
  .storage.object()
  .onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    // Exit if this is triggered on a file that is not an image.
    if (!contentType || (contentType && !contentType.startsWith("image/"))) {
      return null;
    }
    if (filePath) {
      const fileName = path.basename(filePath);
      if (!filePath.startsWith("keysets/")) {
        return null;
      }

      // Download file from bucket.
      const bucket = storage.bucket(fileBucket);

      const metadata = {
        contentType: contentType,
      };

      const cardFilePath = path.join("card/", fileName);
      // Create write stream for uploading thumbnail
      const cardUploadStream = bucket.file(cardFilePath).createWriteStream({ metadata });

      // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
      const cardPipeline = sharp();
      cardPipeline.resize(320, 180).pipe(cardUploadStream);

      bucket.file(filePath).createReadStream().pipe(cardPipeline);

      cardUploadStream
        .on("finish", () => {
          console.log("Created card thumbnail for " + fileName);
        })
        .on("error", (err) => {
          console.log("Failed to create card thumbnail for " + fileName + ": " + err);
        });

      const listFilePath = path.join("list/", fileName);
      // Create write stream for uploading thumbnail
      const listUploadStream = bucket.file(listFilePath).createWriteStream({ metadata });

      // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
      const listPipeline = sharp();
      listPipeline.resize(100, 56).pipe(listUploadStream);

      bucket.file(filePath).createReadStream().pipe(listPipeline);

      listUploadStream
        .on("finish", () => {
          console.log("Created list thumbnail for " + fileName);
        })
        .on("error", (err) => {
          console.log("Failed to create list thumbnail for " + fileName + ": " + err);
        });

      const imageListFilePath = path.join("image-list/", fileName);
      // Create write stream for uploading thumbnail
      const imageListUploadStream = bucket.file(imageListFilePath).createWriteStream({ metadata });

      // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
      const imageListPipeline = sharp();
      imageListPipeline.resize(320, 320).pipe(imageListUploadStream);

      bucket.file(filePath).createReadStream().pipe(imageListPipeline);

      imageListUploadStream
        .on("finish", () => {
          console.log("Created image list thumbnail for " + fileName);
        })
        .on("error", (err) => {
          console.log("Failed to create image list thumbnail for " + fileName + ": " + err);
        });

      const thumbsFilePath = path.join("thumbs/", fileName);
      // Create write stream for uploading thumbnail
      const thumbsUploadStream = bucket.file(thumbsFilePath).createWriteStream({ metadata });

      // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
      const thumbsPipeline = sharp();
      thumbsPipeline.resize(480, 270).pipe(thumbsUploadStream);

      bucket.file(filePath).createReadStream().pipe(thumbsPipeline);

      thumbsUploadStream
        .on("finish", () => {
          console.log("Created generic thumbnail for " + fileName);
        })
        .on("error", (err) => {
          console.log("Failed to create generic thumbnail for " + fileName + ": " + err);
        });

      const streams = [cardUploadStream, listUploadStream, imageListUploadStream, thumbsUploadStream];

      const allPromises = Promise.all(
        streams.map((stream) => {
          return new Promise((resolve, reject) => stream.on("finish", resolve).on("error", reject));
        })
      );

      allPromises
        .then(() => {
          // delete original if all thumbnails created
          return bucket.deleteFiles({
            maxResults: 1,
            prefix: filePath,
          });
        })
        .catch((error) => {
          console.log("Failed to create thumbnail for " + fileName + ": " + error);
        });

      return await allPromises;
    }
    return null;
  });

exports.createThumbs = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }

  console.log("Creating thumbnails");

  // Download file from bucket.
  const bucket = storage.bucket("keycaplendar.appspot.com");
  const [files] = await bucket.getFiles({ prefix: "keysets/" });
  const metadata = {
    contentType: "image/png",
  };

  const filesPromise = new Promise<void>((resolve, reject) => {
    let filesProcessed = 0;
    const increase = () => filesProcessed++;
    for (const file of files) {
      const fileName = path.basename(file.name);
      console.log(fileName);
      const thumbsFilePath = path.join("thumbs/", fileName);
      // Create write stream for uploading thumbnail
      const thumbsUploadStream = bucket.file(thumbsFilePath).createWriteStream({ metadata });

      // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
      const thumbsPipeline = sharp();
      thumbsPipeline.resize(480, 270).pipe(thumbsUploadStream);

      file.createReadStream().pipe(thumbsPipeline);

      thumbsUploadStream
        .on("finish", () => {
          console.log("Created generic thumbnail for " + fileName);
          increase();
        })
        .on("error", (err) => {
          console.log("Failed to generic thumbnail for " + fileName + ": " + err);
          reject(err);
        });
      if (filesProcessed === files.length) {
        resolve();
      }
    }
  });
  return filesPromise;
});

exports.getClaims = functions.https.onCall((data, context) => {
  if (context.auth) {
    return {
      nickname: context.auth.token.nickname ? context.auth.token.nickname : "",
      designer: context.auth.token.designer ? context.auth.token.designer : false,
      editor: context.auth.token.editor ? context.auth.token.editor : false,
      admin: context.auth.token.admin ? context.auth.token.admin : false,
    };
  }
  return {
    nickname: "",
    designer: false,
    editor: false,
    admin: false,
  };
});

exports.onKeysetUpdate = functions.firestore.document("keysets/{keysetId}").onWrite(async (change, context) => {
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

exports.listUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }
  const listUsers = async (nextPageToken: string) => {
    const processResult = (result: admin.auth.ListUsersResult) => {
      const users = result.users.map((user) => {
        if (user.customClaims) {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: user.customClaims.nickname ? user.customClaims.nickname : "",
            designer: user.customClaims.designer ? true : false,
            editor: user.customClaims.editor ? true : false,
            admin: user.customClaims.admin ? true : false,
          };
        } else {
          return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            nickname: "",
            designer: false,
            editor: false,
            admin: false,
          };
        }
      });
      return { users: users, nextPageToken: result.pageToken };
    };
    if (nextPageToken) {
      const result = await admin
        .auth()
        .listUsers(data.length, nextPageToken)
        .then((result) => processResult(result))
        .catch((error) => {
          return { error: "Error listing users: " + error };
        });
      return result;
    } else {
      const result = await admin
        .auth()
        .listUsers(data.length)
        .then((result) => processResult(result))
        .catch((error) => {
          return { error: "Error listing users: " + error };
        });
      return result;
    }
  };
  // List batch of users, 1000 at a time.
  const result = await listUsers(data.nextPageToken);
  return result;
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "Current user is not an admin. Access is not permitted.",
    };
  }
  if (data.email === "ben.j.durrant@gmail.com") {
    return {
      error: "This user cannot be deleted",
    };
  }
  const currentUser = await admin.auth().getUser(context.auth.uid);
  const user = await admin.auth().getUserByEmail(data.email);
  admin
    .auth()
    .deleteUser(user.uid)
    .then(() => {
      console.log(currentUser.displayName + " successfully deleted account of " + user.displayName + ".");
      return null;
    })
    .catch((error) => {
      return { error: "Error deleting user: " + error };
    });

  db.collection("users")
    .doc(user.uid)
    .delete()
    .then(() => {
      console.log("Deleted user preference file for " + user.displayName + ".");
      return null;
    })
    .catch((error) => {
      console.log("Failed to delete user preference file:" + error);
    });
  return "Success";
});

exports.setRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    return {
      error: "User not admin.",
    };
  }
  const currentUser = await admin.auth().getUser(context.auth.uid);
  const user = await admin.auth().getUserByEmail(data.email);
  const claims = {
    designer: data.designer,
    nickname: data.nickname,
    editor: data.editor,
    admin: data.admin,
  };
  await admin
    .auth()
    .setCustomUserClaims(user.uid, claims)
    .then(() => {
      console.log(
        `${currentUser.displayName} successfully edited account of ${user.displayName}. Designer: ${data.designer}, editor: ${data.editor}, admin: ${data.admin}, nickname: ${data.nickname}`
      );
      return null;
    })
    .catch((error) => {
      return { error: "Error setting roles: " + error };
    });
  const newUser = await admin.auth().getUserByEmail(data.email);
  return newUser.customClaims;
});

exports.apiAuth = functions.https.onRequest(async (request, response) => {
  const key = request.body.key;
  const secret = request.body.secret;
  if (!key || !secret) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const usersRef = db.collection("apiUsers");
  const snapshot = await usersRef.where("apiKey", "==", key).where("apiSecret", "==", secret).get();
  if (snapshot.empty) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const ts = Math.round(new Date().getTime() / 1000);
  let user: {
    apiAccess: boolean;
    email: string;
  } = {
    apiAccess: false,
    email: "",
  };
  const payload = {
    apiAccess: false,
    email: "",
    iat: ts,
    exp: ts + 1800,
  };
  snapshot.forEach((doc) => {
    user = { ...doc.data(), apiAccess: doc.data().apiAccess, email: doc.data().email };
  });
  if (user.apiAccess !== true) {
    response.status(401).send({ error: "Unauthorized" });
  }
  payload.email = user.email;
  payload.apiAccess = user.apiAccess;

  const accessToken = jwt.sign(payload, functions.config().jwt.secret, {
    algorithm: "HS256",
  });

  response.status(200).send({ token: accessToken });
});

const verify = (req: functions.Request) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ");
    if (accessToken.length !== 2 || !accessToken[1]) return false;
    let payload;
    try {
      payload = jwt.verify(accessToken[1], functions.config().jwt.secret);
      return payload;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return false;
};

exports.getAllKeysets = functions.https.onRequest(async (request, response) => {
  const auth = verify(request);
  if (auth === false) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const returnKeysets = async (ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
    const snapshot = await ref.get();
    const keysets: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      keysets.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    response.send(JSON.stringify(keysets));
  };
  const validDateFilter = (dateFilter: string | undefined): dateFilter is string => {
    return !!dateFilter && (dateFilter === "icDate" || dateFilter === "gbLaunch" || dateFilter === "gbEnd");
  };
  const validDate = (date: string | undefined): date is string => {
    const regex = /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
    return !!date && regex.test(date);
  };
  const keysetsRef = db.collection("keysets");
  const dateFilterQuery = request.query.dateFilter as string | undefined;
  const beforeDateQuery = request.query.before as string | undefined;
  const afterDateQuery = request.query.date as string | undefined;
  if (validDateFilter(dateFilterQuery) && validDate(beforeDateQuery) && validDate(afterDateQuery)) {
    const filteredRef = keysetsRef
      .where(dateFilterQuery, "<=", beforeDateQuery)
      .where(dateFilterQuery, ">=", afterDateQuery);
    returnKeysets(filteredRef);
  } else if (validDateFilter(dateFilterQuery) && validDate(beforeDateQuery)) {
    const filteredRef = keysetsRef.where(dateFilterQuery, "<=", beforeDateQuery);
    returnKeysets(filteredRef);
  } else if (validDateFilter(dateFilterQuery) && validDate(afterDateQuery)) {
    const filteredRef = keysetsRef.where(dateFilterQuery, ">=", afterDateQuery);
    returnKeysets(filteredRef);
  } else {
    returnKeysets(keysetsRef);
  }
});

exports.getKeysetById = functions.https.onRequest(async (request, response) => {
  const auth = verify(request);
  if (auth === false) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const keysetsRef = db.collection("keysets");
  if (request.query.id) {
    const docRef = keysetsRef.doc(request.query.id as string);
    const doc = await docRef.get();
    if (!doc.exists) {
      response.send("No document with this ID.");
    } else {
      const keyset = { id: doc.id, ...doc.data() };
      response.send(JSON.stringify(keyset));
    }
  } else {
    response.send("No id provided.");
  }
});
