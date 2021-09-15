import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as jwt from "jsonwebtoken";
import { KeysetDoc, KeysetId } from "./slices/firebase/types";
import { dateSorts, pages } from "./slices/main/constants";
import { pageConditions } from "./slices/main/functions";
import { StatisticsSetType } from "./slices/statistics/types";
import { arrayIncludes } from "./slices/util/functions";

/**
 * Takes a key and secret within a POST request, and returns a JWT token to be used in other API operations.
 */

export const apiAuth = functions.https.onRequest(async (request, response) => {
  const key = request.body.key;
  const secret = request.body.secret;
  if (!key || !secret) {
    response.status(401).json({ error: "Unauthorized" });
  }
  const usersRef = admin.firestore().collection("apiUsers");
  const snapshot = await usersRef.where("apiKey", "==", key).where("apiSecret", "==", secret).get();
  if (snapshot.empty) {
    response.status(401).json({ error: "Unauthorized" });
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
    response.status(401).json({ error: "Unauthorized" });
  }
  payload.email = user.email;
  payload.apiAccess = user.apiAccess;

  const accessToken = jwt.sign(payload, functions.config().jwt.secret, {
    algorithm: "HS256",
  });

  response.status(200).json({ token: accessToken });
});

/**
 * Verifies a request by checking the JWT bearer token in the authorisation header.
 * @param req HTTPS request.
 * @returns Whether the request has the correct JWT token.
 */

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

/**
 * Returns all keysets according to the included URL params. Requires the JWT token from `apiAuth` in the authorisation header.
 */

export const getAllKeysets = functions.https.onRequest(async (request, response) => {
  const auth = verify(request);
  if (auth === false) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const returnKeysets = async (ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
    const snapshot = await ref.get();
    const keysets: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { latestEditor, ...data } = doc.data();
      keysets.push({
        id: doc.id,
        ...data,
      });
    });
    response.status(200).json(keysets);
  };
  const validDateFilter = (dateFilter: string | undefined): dateFilter is typeof dateSorts[number] =>
    !!dateFilter && arrayIncludes(dateSorts, dateFilterQuery);
  const validDate = (date: string | undefined): date is string => {
    const regex = /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
    return !!date && regex.test(date);
  };
  const keysetsRef = admin.firestore().collection("keysets");
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

/**
 * Returns the keysets for the particular page. Requires the JWT token from `apiAuth` in the authorisation header.
 */

export const getKeysetsByPage = functions.https.onRequest(async (request, response) => {
  const auth = verify(request);
  if (auth === false) {
    response.status(401).send({ error: "Unauthorized" });
  }
  const page = request.path.split("/").slice(-1)[0];
  if (page && arrayIncludes(pages, page)) {
    try {
      const snapshot = await admin.firestore().collection("keysets").get();
      const keysets: StatisticsSetType[] = [];
      snapshot.forEach((doc) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { latestEditor, ...data } = doc.data() as KeysetDoc;
        keysets.push({
          id: doc.id,
          ...data,
        });
      });
      const filteredKeysets = keysets.filter((set) => pageConditions(set)[page]);
      response.status(200).json(filteredKeysets);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error });
    }
  } else {
    response.status(400).json({ error: "Invalid/no page provided." });
  }
});

/**
 * Returns the keyset with the included ID. Requires the JWT token from `apiAuth` in the authorisation header.
 */

export const getKeysetById = functions.https.onRequest(async (request, response) => {
  const auth = verify(request);
  if (auth === false) {
    response.status(401).json({ error: "Unauthorized" });
  }
  const keysetsRef = admin.firestore().collection("keysets");
  if (request.query.id) {
    const docRef = keysetsRef.doc(request.query.id as KeysetId);
    const doc = await docRef.get();
    if (!doc.exists) {
      response.status(404).json({ error: "No document with this ID." });
    } else {
      const keyset = { id: doc.id, ...doc.data() };
      response.status(200).json(keyset);
    }
  } else {
    response.status(400).json({ error: "No id provided." });
  }
});
