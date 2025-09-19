import { auth, db } from "../config/firebase.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // Check if email already exists in Firestore
    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!existingUser.empty) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    // Generate UID and hash password
    const uid = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    // Store user profile in Firestore
    const userData = {
      uid,
      firstName,
      lastName,
      email,
      passwordHash,
      profilePicture: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection("users").doc(uid).set(userData);

    // Create custom token (this will create the Auth user on frontend sign-in)
    const customToken = await auth.createCustomToken(uid);

    console.log("✅ User signed up successfully, custom token generated");

    res.status(201).json({
      success: true,
      customToken,
      user: {
        uid,
        email,
        firstName,
        lastName,
      },
      message:
        "User created successfully. Use customToken to sign in on frontend.",
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Signup failed", message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password required" });
    }

    // Find user in Firestore
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (userSnapshot.empty) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const userData = userSnapshot.docs[0].data();
    const uid = userData.uid;

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.passwordHash
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Create custom token
    const customToken = await auth.createCustomToken(uid);

    console.log("✅ User logged in successfully, custom token generated");

    res.status(200).json({
      success: true,
      customToken,
      user: {
        uid,
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.profilePicture,
      },
      message: "Login successful. Use customToken to sign in on frontend.",
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Login failed", message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, error: "ID token required" });
    }

    // Verify Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid; // Use Google's UID for consistency
    const email = decodedToken.email;
    const name = decodedToken.name || "";
    const picture = decodedToken.picture || "";

    // Check if user exists in Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      // Create new profile
      const [firstName, ...lastName] = name.split(" ");
      const userData = {
        uid,
        firstName: firstName || "",
        lastName: lastName.join(" ") || "",
        email,
        profilePicture: picture,
        passwordHash: "", // No password for Google users
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection("users").doc(uid).set(userData);
    } else {
      // Update last login
      await db
        .collection("users")
        .doc(uid)
        .update({ updatedAt: new Date().toISOString() });
    }

    // Create custom token
    const customToken = await auth.createCustomToken(uid);

    console.log("✅ Google auth successful, custom token generated");

    res.status(200).json({
      success: true,
      customToken,
      user: {
        uid,
        email,
        displayName: name,
        profilePicture: picture,
      },
      message:
        "Google auth successful. Use customToken to sign in on frontend.",
    });
  } catch (error) {
    console.error("❌ Google auth error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Google auth failed",
        message: error.message,
      });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: "Token required" });
    }

    const decodedToken = await auth.verifyIdToken(token);

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ success: false, error: "User profile not found" });
    }

    const userData = userDoc.data();

    console.log("✅ Token verified successfully");

    res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.profilePicture,
      },
    });
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    res
      .status(401)
      .json({ success: false, error: "Invalid token", message: error.message });
  }
};
