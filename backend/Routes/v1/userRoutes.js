import express from "express";
import {
  GetUserDetails,
  UpdatePassword,
  UpdateProfile,
  UpdateUserRole,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getSingleUser,
  logIn,
  logOut,
  registerUser,
  registerDoctor,
  resetPassword,
  verifyEmail,
  refreshToken,
  resendVerificationEmail,
} from "../../Controllers/v1/userControllers.js";
import { authrizeRole, isAuthenticatedUser } from "../../Middleware/authE.js";
import { authLimiter, passwordResetLimiter, emailVerificationLimiter } from "../../Middleware/rateLimiter.js";
import { uploadDocument } from "../../utilis/cloudinary.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authLimiter, registerUser);
router.post("/register/doctor", authLimiter, uploadDocument.single("licenseDocument"), registerDoctor);
router.post("/login", authLimiter, logIn);
router.post("/password/forgot", passwordResetLimiter, forgetPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", emailVerificationLimiter, resendVerificationEmail);
router.post("/refresh-token", refreshToken);
router.get("/logout", isAuthenticatedUser, logOut);

// Protected routes
router.get("/details", isAuthenticatedUser, GetUserDetails);
router.put("/password/update", isAuthenticatedUser, UpdatePassword);
router.put("/profile/update", isAuthenticatedUser, UpdateProfile);

// Admin routes
router.get("/admin/allUsers", isAuthenticatedUser, authrizeRole("admin", "super_admin"), getAllUsers);
router.get("/admin/user/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), getSingleUser);
router.put("/admin/user/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), UpdateUserRole);
router.delete("/admin/user/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), deleteUser);

export default router;
