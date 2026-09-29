require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
  
  const db = admin.firestore();
  db.collection('products').limit(1).get().then(() => {
    console.log("SUCCESS");
    process.exit(0);
  }).catch(err => {
    console.error("FIRESTORE ERROR:", err);
    process.exit(1);
  });
} catch(err) {
  console.error("INIT ERROR:", err);
  process.exit(1);
}
