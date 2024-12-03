// setAdminClaim.js
const admin = require("firebase-admin");
const serviceAccount = require("../../functions/serviceAccountKey.json"); // Adjust the path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const setAdminClaim = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Custom claims set for user ${email}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

setAdminClaim("lignjoslav@example.com"); // Replace with your admin email