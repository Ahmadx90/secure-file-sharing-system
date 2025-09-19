// Backend/config/firebase.js - Consolidated Firebase Admin initialization
import admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer GOOGLE_APPLICATION_CREDENTIALS env path, then local service-account-key.json
const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;
const localKeyPath = path.join(__dirname, "../service-account-key.json");
let serviceAccount = null;

if (envKeyPath && existsSync(envKeyPath)) {
  serviceAccount = JSON.parse(readFileSync(envKeyPath, "utf8"));
} else if (existsSync(localKeyPath)) {
  serviceAccount = JSON.parse(readFileSync(localKeyPath, "utf8"));
} else {
  console.warn("⚠️ No service account key found. Falling back to env vars.");
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    token_uri: "https://oauth2.googleapis.com/token",
  };
}

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      // Explicitly use GCP_BUCKET_NAME, no fallback to .appspot.com
      storageBucket: process.env.GCP_BUCKET_NAME,
    });
    console.log(
      "✅ Firebase Admin initialized successfully with bucket:",
      process.env.GCP_BUCKET_NAME
    );
  } catch (err) {
    console.error("❌ Firebase init error:", err.message);
    throw err;
  }
}

// Export Firestore, Auth, and Storage
export const db = admin.firestore();
export const auth = admin.auth();

// Google Cloud Storage client
const gcs = new Storage({
  projectId: process.env.GCP_PROJECT_ID || serviceAccount.project_id,
  credentials: serviceAccount,
});
export const bucket = gcs.bucket(process.env.GCP_BUCKET_NAME); // No fallback, must be set

// Verify Firebase ID token helper
export async function verifyToken(token) {
  if (!token) throw new Error("No token provided");
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    throw new Error("Invalid or expired token");
  }
}

export default admin;
