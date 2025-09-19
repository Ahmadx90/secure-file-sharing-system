import { db } from "../config/firebase.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    const userData = userDoc.data();

    console.log("✅ Profile retrieved");

    res.status(200).json({
      success: true,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profilePicture: userData.profilePicture,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Get profile error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to get profile",
        message: error.message,
      });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, profilePicture } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (profilePicture) updateData.profilePicture = profilePicture;

    await db.collection("users").doc(user.uid).update(updateData);

    console.log("✅ Profile updated");

    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("❌ Update profile error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update profile",
        message: error.message,
      });
  }
};
