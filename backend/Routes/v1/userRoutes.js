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
  sendOtp,
  verifyOtp,
  resetPasswordOtp,
} from "../../Controllers/v1/userControllers.js";
import { authrizeRole, isAuthenticatedUser } from "../../Middleware/authE.js";
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from "../../Middleware/rateLimiter.js";

const router = express.Router();

// ── Public auth routes ─────────────────────────────────────────────────────

// Register
router.post("/register", authLimiter, registerUser);
router.post("/register/patient", authLimiter, registerUser);           // alias
router.post("/register/doctor", authLimiter, registerDoctor);

// Login / Logout
router.post("/login", authLimiter, logIn);
router.post("/logout", isAuthenticatedUser, logOut);
router.get("/logout", isAuthenticatedUser, logOut);                    // support GET too

// Token refresh
router.post("/refresh-token", refreshToken);

// OTP flow
router.post("/send-otp", emailVerificationLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);

// Password reset (OTP-based — used by frontend)
router.post("/forgot-password", passwordResetLimiter, forgetPassword);
router.post("/reset-password", resetPasswordOtp);

// Password reset (token-based — legacy, keep for email links)
router.post("/password/forgot", passwordResetLimiter, forgetPassword);
router.put("/password/reset/:token", resetPassword);

// Email verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", emailVerificationLimiter, resendVerificationEmail);

// ── Protected user routes ──────────────────────────────────────────────────
router.get("/me", isAuthenticatedUser, GetUserDetails);
router.get("/details", isAuthenticatedUser, GetUserDetails);
router.put("/password/update", isAuthenticatedUser, UpdatePassword);
router.put("/profile/update", isAuthenticatedUser, UpdateProfile);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get(
  "/admin/allUsers",
  isAuthenticatedUser,
  authrizeRole("admin", "super_admin"),
  getAllUsers
);
router.get(
  "/admin/user/:id",
  isAuthenticatedUser,
  authrizeRole("admin", "super_admin"),
  getSingleUser
);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authrizeRole("admin", "super_admin"),
  UpdateUserRole
);
router.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  authrizeRole("admin", "super_admin"),
  deleteUser
);

export default router;
