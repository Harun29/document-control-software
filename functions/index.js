const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://document-control-software.firebaseio.com",
});

// Function to create a user
module.exports.createUser = functions.https.onCall(async (data) => {

  const { email, password, firstName, lastName, role, org } = data;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      role,
      org,
    });

    const orgRef = admin.firestore().collection("org").doc(org);
    await orgRef.update({
      users: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
    });

    return { message: "User created successfully", uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new functions.https.HttpsError("internal", "User creation failed");
  }
});

// Function to delete a user
module.exports.deleteUser = functions.https.onCall(async (data) => {
  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'userId' parameter is required."
    );
  }

  try {
    await admin.auth().deleteUser(userId);

    const userDocRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const userOrg = userDoc.data().org;

      const orgRef = admin.firestore().collection("org").doc(userOrg);
      await orgRef.update({
        users: admin.firestore.FieldValue.arrayRemove(userId),
      });

      await userDocRef.delete();
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError("internal", "User deletion failed");
  }
});
