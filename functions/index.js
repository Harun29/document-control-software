const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://document-control-software.firebaseio.com",
});

// Function to create a user
module.exports.createUser = functions.https.onCall(async (data) => {
  console.log("Received data:", data.data);

  const { email, password, firstName, lastName, role, org, orgName } = data.data;

  if (!email || !password || !firstName || !lastName || !role || !org || !orgName) {
    console.error("Missing required fields in the input data:", data.data);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "All fields (email, password, firstName, lastName, role, org) are required."
    );
  }

  try {
    console.log("Creating Firebase Auth user with email:", email);
    const userRecord = await admin.auth().createUser({ email, password });
    console.log("Firebase Auth user created successfully:", userRecord.uid);

    console.log("Saving user data to Firestore for UID:", userRecord.uid);
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      role,
      org,
      orgName
    });
    console.log("User data saved to Firestore for UID:", userRecord.uid);

    console.log("Updating department document for org:", org);
    const orgRef = admin.firestore().collection("org").doc(org);
    await orgRef.update({
      users: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
    });
    if(role === "Editor"){
      await orgRef.update({
        editors: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
      })
    }
    console.log("Department document updated successfully for org:", org);

    return { message: "User created successfully", uid: userRecord.uid };
  } catch (error) {
    console.error("Error during user creation process:", error);

    // More specific error logging based on Firebase Auth or Firestore
    if (error.code === "auth/email-already-exists") {
      console.error("The email is already associated with an existing user:", email);
      throw new functions.https.HttpsError("already-exists", "Email already exists.");
    } else if (error.code === "auth/invalid-password") {
      console.error("The password does not meet the security requirements.");
      throw new functions.https.HttpsError("invalid-argument", "Invalid password.");
    } else {
      console.error("Unhandled error during user creation:", error.message);
      throw new functions.https.HttpsError("internal", "User creation failed.");
    }
  }
});

// Function to delete a user
module.exports.deleteUser = functions.https.onCall(async (data) => {
  const { userId } = data.data;

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
