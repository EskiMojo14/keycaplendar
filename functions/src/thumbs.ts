import * as functions from "firebase-functions";
import { Storage } from "@google-cloud/storage";
import * as path from "path";
import * as sharp from "sharp";

const storage = new Storage();

const runtimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 540,
  memory: "2GB",
};

export const createThumbsAuto = functions
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

export const createThumbs = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
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
