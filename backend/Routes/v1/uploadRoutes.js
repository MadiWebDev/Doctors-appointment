import express from "express";
import { uploadProfileImage, uploadDocument, uploadToCloudinary } from "../../utilis/cloudinary.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";

const router = express.Router();

// Upload profile image (Doctor only)
router.post("/profile-image", isAuthenticatedUser, authrizeRole("doctor"), uploadProfileImage.single("image"), catchAsyncError(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "doctor-appointments/profile-images",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image to Cloudinary",
    });
  }
}));

// Upload document (Doctor only)
router.post("/document", isAuthenticatedUser, authrizeRole("doctor"), uploadDocument.single("document"), catchAsyncError(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "doctor-appointments/documents",
      allowed_formats: ["pdf", "jpg", "jpeg", "png"],
      resource_type: "auto",
    });

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        public_id: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading document to Cloudinary",
    });
  }
}));

export default router;
