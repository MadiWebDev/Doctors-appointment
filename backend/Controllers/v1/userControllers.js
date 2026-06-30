import userService from "../../Services/userService.js";
import sendToken from "../../utilis/jwtToken.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema, forgotPasswordSchema, resetPasswordSchema, updateRoleSchema } from "../../Validators/userValidator.js";
import Doctor from "../../Models/doctorModels.js";
import { uploadDocument, uploadToCloudinary } from "../../utilis/cloudinary.js";

//*** Register User  **//
export const registerUser = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const user = await userService.registerUser(validationResult.data);
  sendToken(user, 201, res);
});

//*** Register Doctor  **//
export const registerDoctor = catchAsyncError(async (req, res, next) => {
  try {
    console.log("Doctor registration request received");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("File present:", !!req.file);

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      licenseNumber,
      specialization,
      experience,
      hospitalAffiliation,
      consultationFee,
      bio,
      qualifications,
      city, // Add these
      state,
      country,
      zipCode,
      street,
      latitude, // Add these for location
      longitude,
    } = req.body;

    console.log("Extracted fields:", { name, email, phone, licenseNumber, specialization });

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const User = await import("../../Models/userModels.js").then(m => m.default);
    const userExists = await User.findOne({ email }) || await Doctor.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    console.log("Creating user...");
    // Create user with role "doctor"
    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
      phone,
    });
    console.log("User created successfully:", user._id);

    // Handle license document upload
    let licenseDocumentUrl = null;
    if (req.file) {
      try {
        console.log("Uploading file to Cloudinary...");
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "doctor-appointments/license-documents",
          allowed_formats: ["pdf", "jpg", "jpeg", "png"],
          resource_type: "auto",
        });
        licenseDocumentUrl = result.secure_url;
        console.log("File uploaded successfully:", licenseDocumentUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Don't fail registration if upload fails, just log it
      }
    }

    // Parse qualifications from comma-separated string
    const qualificationsArray = qualifications 
      ? qualifications.split(',').map(q => q.trim()).filter(q => q.length > 0)
      : [];

    // Split name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || "";

    console.log("Creating doctor profile...");
    const doctor = await Doctor.create({
      user: user._id,
      firstName,
      lastName,
      licenseNumber,
      licenseDocument: licenseDocumentUrl,
      specialization,
      experience: Number(experience) || 0,
      hospitalAffiliation,
      consultationFee: Number(consultationFee) || 0,
      bio: bio || "",
      qualifications: qualificationsArray,
      phone,
      
      // Add address
      address: {
        street: street || "",
        city: city || "",
        state: state || "",
        country: country || "",
        zipCode: zipCode || "",
      },
      
      // Add location (required)
      location: {
        type: "Point",
        coordinates: [
          Number(longitude) || 0,
          Number(latitude) || 0
        ]
      },
      
      status: "pending",
    });
    console.log("Doctor profile created successfully:", doctor._id);

    sendToken(user, 201, res);
  } catch (error) {
    console.error("Doctor registration error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
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
  res.cookie("accessToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  res.status(200).json({
    success: true,
    message: "logged Out Successfully",
  });
});

//*** forget Password ***/
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = forgotPasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const result = await userService.forgotPassword(validationResult.data.email);
  res.status(200).json(result);
});

//** get reset password **/
export const resetPassword = catchAsyncError(async (req, res, next) => {
  // Validate input with Zod
  const validationResult = resetPasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const { password, confirmPassword } = validationResult.data;
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
    sameSite: "strict",
  };

  res.status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .json({
    success: true,
    user,
    accessToken,
  });
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
