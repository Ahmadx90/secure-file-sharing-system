import { db, bucket } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { formatFileSize } from "../utils/formatFileSize.js";

export const uploadFile = async (req, res) => {
  try {
    const {
      accessLevel = "private",
      password,
      maxDownloads,
      expiryHours,
    } = req.body;
    const file = req.file;
    const user = req.user;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file provided" });
    }

    const fileId = uuidv4();
    const fileExtension = file.originalname.split(".").pop() || "bin";
    const fileName = `${fileId}.${fileExtension}`;
    const storagePath = `files/${user.uid}/${fileName}`;

    // Upload to Google Cloud Storage
    const gcsFile = bucket.file(storagePath);
    await gcsFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          ownerId: user.uid,
          originalName: file.originalname,
        },
      },
    });

    // Determine shareableLink
    let shareableLink = null;
    let expireAt = null;
    if (expiryHours) {
      expireAt = new Date(Date.now() + parseInt(expiryHours) * 3600000);
    }

    if (accessLevel === "public") {
      // Signed URL for public, with expiry matching file or default
      const signedExpiry = expireAt
        ? expireAt.getTime()
        : Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days default
      try {
        const [url] = await gcsFile.getSignedUrl({
          action: "read",
          expires: signedExpiry,
        });
        shareableLink = url;
      } catch (error) {
        console.error("❌ Failed to generate signed URL:", error.message);
        return res
          .status(500)
          .json({ success: false, error: "Signed URL generation failed" });
      }
    } else if (accessLevel === "protected") {
      // Frontend page for protected
      shareableLink = `http://localhost:3000/download/${fileId}`; // Align with App.tsx route; use process.env.CLIENT_URL in prod
    }

    // Hash password if protected
    let passwordHash = null;
    if (accessLevel === "protected" && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Calculate expiry
    // expireAt is already declared above
    if (expiryHours) {
      expireAt = new Date(Date.now() + parseInt(expiryHours) * 3600000);
    }

    // Save metadata to Firestore
    const fileData = {
      id: fileId,
      filename: fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size.toString(),
      accessLevel,
      passwordHash,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      downloadCount: 0,
      expireAt,
      ownerId: user.uid,
      storagePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareableLink,
    };
    await db.collection("files").doc(fileId).set(fileData);

    console.log("✅ File uploaded successfully");
    res.status(201).json({
      success: true,
      file: {
        ...fileData,
        size: formatFileSize(file.size),
        shareableLink,
      },
    });
  } catch (error) {
    console.error(
      "❌ Upload error:",
      error.message,
      "Bucket used:",
      bucket.name
    );
    res
      .status(500)
      .json({ success: false, error: "Upload failed", message: error.message });
  }
};

// [Rest of the file remains unchanged]

export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { password } = req.body;
    const user = req.user || null; // Optional auth

    const fileRef = db.collection("files").doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const fileData = fileDoc.data();

    // Check expiry
    if (fileData.expireAt && new Date(fileData.expireAt) < new Date()) {
      return res.status(410).json({ success: false, error: "File expired" });
    }

    // Check download limit
    if (
      fileData.maxDownloads &&
      fileData.downloadCount >= fileData.maxDownloads
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Download limit exceeded" });
    }

    // Access control
    if (fileData.accessLevel === "private") {
      if (!user || user.uid !== fileData.ownerId) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
    } else if (fileData.accessLevel === "protected") {
      if (!password || !fileData.passwordHash) {
        return res
          .status(401)
          .json({ success: false, error: "Password required" });
      }
      const isValid = await bcrypt.compare(password, fileData.passwordHash);
      if (!isValid) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid password" });
      }
    }

    // Download from Storage
    const gcsFile = bucket.file(fileData.storagePath);
    const [buffer] = await gcsFile.download();

    // Update count
    await fileRef.update({
      downloadCount: fileData.downloadCount + 1,
      updatedAt: new Date().toISOString(),
    });

    console.log("✅ File downloaded successfully");

    // Return as base64 (as in your original)
    const base64 = buffer.toString("base64");
    res.status(200).json({
      success: true,
      file: {
        data: base64,
        filename: fileData.originalName,
        mimeType: fileData.mimeType,
      },
    });
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).json({
      success: false,
      error: "Download failed",
      message: error.message,
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = req.user;

    const fileRef = db.collection("files").doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const fileData = fileDoc.data();

    if (user.uid !== fileData.ownerId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Delete from Storage
    const gcsFile = bucket.file(fileData.storagePath);
    await gcsFile.delete();

    // Delete from Firestore
    await fileRef.delete();

    console.log("✅ File deleted successfully");

    res.status(200).json({ success: true, message: "File deleted" });
  } catch (error) {
    console.error("❌ Delete error:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Delete failed", message: error.message });
  }
};

export const getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = req.user || null;

    const fileDoc = await db.collection("files").doc(fileId).get();

    if (!fileDoc.exists) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const fileData = fileDoc.data();

    // Access control
    const isOwner = user && user.uid === fileData.ownerId;
    if (fileData.accessLevel === "private" && !isOwner) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const info = {
      id: fileData.id,
      filename: fileData.originalName,
      size: formatFileSize(parseInt(fileData.size)),
      mimeType: fileData.mimeType,
      accessLevel: fileData.accessLevel,
      downloadCount: fileData.downloadCount,
      maxDownloads: fileData.maxDownloads,
      expireAt: fileData.expireAt,
      isExpired: fileData.expireAt && new Date(fileData.expireAt) < new Date(),
      createdAt: fileData.createdAt,
      isOwner,
    };

    console.log("✅ File info retrieved");

    res.status(200).json({ success: true, file: info });
  } catch (error) {
    console.error("❌ File info error:", error.message);
    res.status(500).json({
      success: false,
      error: "Info retrieval failed",
      message: error.message,
    });
  }
};

export const getPublicFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileDoc = await db.collection("files").doc(fileId).get();

    if (!fileDoc.exists) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const fileData = fileDoc.data();

    if (fileData.accessLevel !== "public") {
      return res.status(403).json({ success: false, error: "Not public" });
    }

    const info = {
      id: fileData.id,
      filename: fileData.originalName,
      size: formatFileSize(parseInt(fileData.size)),
      mimeType: fileData.mimeType,
      accessLevel: fileData.accessLevel,
      downloadCount: fileData.downloadCount,
      isExpired: fileData.expireAt && new Date(fileData.expireAt) < new Date(),
    };

    console.log("✅ Public file info retrieved");

    res.status(200).json({ success: true, file: info });
  } catch (error) {
    console.error("❌ Public file info error:", error.message);
    res.status(500).json({
      success: false,
      error: "Info retrieval failed",
      message: error.message,
    });
  }
};

export const getUserFiles = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    const filesRef = db
      .collection("files")
      .where("ownerId", "==", user.uid)
      .orderBy("createdAt", "desc");

    const totalSnapshot = await filesRef.get();
    const totalCount = totalSnapshot.size;

    const snapshot = await filesRef.offset(offset).limit(limitNum).get();

    const files = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let shareableLink = data.shareableLink;
        if (
          data.accessLevel === "public" &&
          (!shareableLink || shareableLink.includes("https://localhost"))
        ) {
          // Regenerate signed URL
          const gcsFile = bucket.file(data.storagePath);
          const signedExpiry = data.expireAt
            ? new Date(data.expireAt).getTime()
            : Date.now() + 7 * 24 * 60 * 60 * 1000;
          const [url] = await gcsFile.getSignedUrl({
            action: "read",
            expires: signedExpiry,
          });
          shareableLink = url;
          await doc.ref.update({ shareableLink });
        } else if (
          data.accessLevel === "protected" &&
          (!shareableLink || shareableLink.includes("http://localhost"))
        ) {
          shareableLink = `http://localhost:3000/download/${data.id}`;
          await doc.ref.update({ shareableLink });
        }
        return {
          id: data.id,
          filename: data.originalName,
          size: formatFileSize(parseInt(data.size)),
          mimeType: data.mimeType,
          accessLevel: data.accessLevel,
          downloadCount: data.downloadCount,
          maxDownloads: data.maxDownloads,
          expireAt: data.expireAt,
          isExpired: data.expireAt && new Date(data.expireAt) < new Date(),
          createdAt: data.createdAt,
          shareableLink: data.shareableLink,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limitNum);

    console.log("✅ User files retrieved");

    res.status(200).json({
      success: true,
      files,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalFiles: totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("❌ User files error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch files",
      message: error.message,
    });
  }
};
