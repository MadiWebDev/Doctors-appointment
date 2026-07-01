import userService from "../../Services/userService.js";
import sendToken from "../../utilis/jwtToken.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema, forgotPasswordSchema, updateRoleSchema } from "../../Validators/userValidator.js";
import Doctor from "../../Models/doctorModels.js";

//*** Register User  **//
export const registerUser = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: errors[0], // send the first error as the top-level message
      errors,
    });
  }

  try {
    const user = await userService.registerUser(validationResult.data);
    sendToken(user, 201, res);
  } catch (error) {
    // Surface mongoose validation errors and known service errors cleanly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0], errors: messages });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
});

//*** Register Doctor  **//
export const registerDoctor = catchAsyncError(async (req, res, next) => {
  const User = await import("../../Models/userModels.js").then((m) => m.default);
  let createdUser = null;

  try {
    const {
      name, email, phone, password, confirmPassword,
      licenseNumber, specialization, experience,
      hospitalAffiliation, consultationFee, bio, qualifications,
      street, city, state, country, zipCode, latitude, longitude,
    } = req.body;

    // ── 1. Required field checks ──────────────────────────────────────────
    const missing = [];
    if (!name)              missing.push("name");
    if (!email)             missing.push("email");
    if (!phone)             missing.push("phone");
    if (!password)          missing.push("password");
    if (!confirmPassword)   missing.push("confirmPassword");
    if (!licenseNumber)     missing.push("licenseNumber");
    if (!specialization)    missing.push("specialization");
    if (experience === undefined || experience === "") missing.push("experience");
    if (!hospitalAffiliation) missing.push("hospitalAffiliation");
    if (consultationFee === undefined || consultationFee === "") missing.push("consultationFee");
    if (!bio)               missing.push("bio");
    if (!qualifications)    missing.push("qualifications");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        fields: missing,
      });
    }

    // ── 2. Password validation ────────────────────────────────────────────
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character",
      });
    }

    // ── 3. Duplicate checks ───────────────────────────────────────────────
    const existingUser   = await User.findOne({ email });
    const existingDoctor = await Doctor.findOne({ licenseNumber });
    if (existingUser)   return res.status(400).json({ success: false, message: "An account with this email already exists" });
    if (existingDoctor) return res.status(400).json({ success: false, message: "A doctor with this license number already exists" });

    // ── 4. Create User ────────────────────────────────────────────────────
    createdUser = await User.create({ name, email, password, role: "doctor", phone });

    // ── 5. Create Doctor profile ──────────────────────────────────────────
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || name;
    const lastName  = nameParts.slice(1).join(" ") || "";

    const qualificationsArray = qualifications
      .split(",")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    await Doctor.create({
      user:               createdUser._id,
      firstName,
      lastName,
      licenseNumber,
      specialization,
      experience:         Number(experience) || 0,
      hospitalAffiliation,
      consultationFee:    Number(consultationFee) || 0,
      bio:                bio || "",
      qualifications:     qualificationsArray,
      phone,
      address: {
        street:  street  || "",
        city:    city    || "",
        state:   state   || "",
        country: country || "",
        zipCode: zipCode || "",
      },
      location: {
        type:        "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
      },
      status: "pending",
    });

    sendToken(createdUser, 201, res);
  } catch (error) {
    // ── Rollback: delete User if Doctor.create failed ─────────────────────
    if (createdUser) {
      await createdUser.deleteOne().catch((e) =>
        console.error("Rollback failed — orphaned user:", e.message)
      );
    }

    console.error("Doctor registration error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    return res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
});

/** LogIn User **/
export const logIn = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const { email, password } = validationResult.data;
  const user = await userService.loginUser(email, password);
  sendToken(user, 201, res);
});

//*** LogOut User ***/
export const logOut = catchAsyncError(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  res
    .status(200)
    .cookie("accessToken", null, cookieOptions)
    .cookie("refreshToken", null, cookieOptions)
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

//*** forget Password ***/
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const validationResult = forgotPasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => err.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  const { email } = validationResult.data;

  // Dynamically import to avoid circular dep
  const User = await import("../../Models/userModels.js").then((m) => m.default);
  const user = await User.findOne({ email });

  if (!user) {
    // Return success regardless to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: `If an account with ${email} exists, a reset OTP has been sent.`,
    });
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  const { default: sendEmail } = await import("../../utilis/sendEmail.js");
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP - MediBook",
      message: `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
    });
  } catch (err) {
    console.error("Forgot password email error:", err.message);
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to ${email}`,
  });
});

//** get reset password (token-based — used by email links) **/
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Password and confirmation are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  const user = await userService.resetPassword(req.params.token, password, confirmPassword);
  sendToken(user, 200, res);
});

//** Get User Details **/
export const GetUserDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User ID is missing"
    });
  }

  const user = await userService.getUserById(userId);
  res.status(200).json({
    success: true,
    user,
  });
});

//** Update Password **/
export const UpdatePassword = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = updatePasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const { oldPassword, newPassword } = validationResult.data;
  const user = await userService.updateUserPassword(req.user._id, oldPassword, newPassword);
  sendToken(user, 200, res);
});

//** Update user profile **/
export const UpdateProfile = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = updateProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const userId = req.user._id;
  const updatedUser = await userService.updateUserProfile(userId, validationResult.data);
  res.status(200).json({ success: true, user: updatedUser });
});

/** Get All Users (Admin)**/
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    users,
  });
});

//** Get One User Details (Admin) **/
export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

/** update user role -Admin   **/
export const UpdateUserRole = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = updateRoleSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const { role } = validationResult.data;
  const user = await userService.updateUserRole(req.params.id, role);
  res.status(200).json({
    success: true,
    user,
  });
});

//** Delete User ---Admin  **/
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await userService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});

//** Verify Email **/
export const verifyEmail = catchAsyncError(async (req, res, next) => {
  const user = await userService.verifyEmail(req.params.token);
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    user,
  });
});

//** Refresh Access Token **/
export const refreshToken = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  const { user, accessToken } = await userService.refreshAccessToken(refreshToken);

  const cookieExpire = parseInt(process.env.COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000;
  const accessTokenOptions = {
    expires: new Date(Date.now() + cookieExpire),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .json({
      success: true,
      user,
      accessToken,
    });
});

//** Send OTP **/
export const sendOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const User = await import("../../Models/userModels.js").then((m) => m.default);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  const { default: sendEmail } = await import("../../utilis/sendEmail.js");
  try {
    await sendEmail({
      email: user.email,
      subject: "OTP Verification - MediBook",
      message: `Your OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    });
  } catch (err) {
    console.error("OTP email error:", err.message);
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to ${email}`,
  });
});

//** Verify OTP **/
export const verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const crypto = await import("crypto");
  const hashedOtp = crypto.default.createHash("sha256").update(otp).digest("hex");

  const User = await import("../../Models/userModels.js").then((m) => m.default);
  const user = await User.findOne({
    email,
    otp: hashedOtp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

//** Reset Password via OTP (frontend flow) **/
export const resetPasswordOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  const crypto = await import("crypto");
  const hashedOtp = crypto.default.createHash("sha256").update(otp).digest("hex");

  const User = await import("../../Models/userModels.js").then((m) => m.default);
  const user = await User.findOne({
    email,
    otp: hashedOtp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  sendToken(user, 200, res);
});

//** Resend Verification Email **/
export const resendVerificationEmail = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const result = await userService.resendVerificationEmail(email);
  res.status(200).json(result);
});
