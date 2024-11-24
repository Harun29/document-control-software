import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const createUser = functions.https.onCall(async (data) => {
  const { email, password, firstName, lastName, role, org } = data;

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

    return { success: true };
  } catch (error) {
    console.error("Error creating user: ", error);
    throw new functions.https.HttpsError("internal", "Error creating user");
  }
});
