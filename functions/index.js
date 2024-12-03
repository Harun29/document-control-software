import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const corsHandler = cors({ origin: true });

export const createUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    const { email, password, firstName, lastName, role, org } = req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      await admin.firestore().collection("users").doc(userRecord.uid).set({
        email,
        firstName,
        lastName,
        role,
        org,
      });

      const orgRef = admin.firestore().collection("orgs").doc(org);
      const orgDoc = await orgRef.get();
      const orgData = orgDoc.data();
      await orgRef.update({
        users: [...(orgData?.users || []), userRecord.uid],
      });

      res.status(200).send({ success: true, uid: userRecord.uid });
    } catch (error) {
      console.error("Error creating user: ", error);
      res.status(500).send({ error: "Error creating user" });
    }
  });
});
