import User from "../Models/userModels.js";
import Patient from "../Models/patientModels.js";
import Doctor from "../Models/doctorModels.js";
import ErrorHandler from "../utilis/errorHandler.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from "../utilis/sendEmail.js";

export class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { email, password, confirmPassword, name, phone } = userData;

    if (password !== confirmPassword) {
      throw new ErrorHandler("Passwords do not match", 400);
    }

    // Validate email
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      throw new ErrorHandler("Invalid email format", 400);
    }

    // Validate password
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      throw new ErrorHandler(
        "Password must be at least 8 characters long, contain at least one number, one uppercase and lowercase letter, and one special character",
        400
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ErrorHandler("User already exists", 400);
    }

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: userData.role || "patient",
    });

    if (!user) {
      throw new ErrorHandler("Internal server error", 500);
    }

    // Automatically create patient profile for users with role "patient"
    if (user.role === "patient") {
      try {
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || name;
        const lastName = nameParts.slice(1).join(" ") || "";

        await Patient.create({
          user: user._id,
          firstName,
          lastName,
          dateOfBirth: new Date("2000-01-01"), // Default date, user can update later
          gender: "other", // Default gender, user can update later
          phone: phone || "0000000000", // Default phone, user can update later
        });
        console.log("✅ Patient profile created automatically for user:", user.email);
      } catch (error) {
        console.error("⚠️ Failed to create patient profile:", error.message);
        // Don't fail registration if patient profile creation fails
      }
    }

    // Note: Doctor profile is created separately via registerDoctor endpoint

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking on the following link:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create this account, please ignore this email.`;

    // Email verification is optional - don't block registration if email fails
    sendEmail({
      email: user.email,
      subject: "Email Verification - Doctor Appointment",
      message,
    }).catch((error) => {
      console.error("Error sending verification email:", error);
      // Don't throw - allow registration to proceed
    });

    return user;
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    if (!email || !password) {
      throw new ErrorHandler("Please Enter Email or Password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ErrorHandler("Invalid Email or Password", 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new ErrorHandler(
        `Account is temporarily locked. Please try again after ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes.`,
        403
      );
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      await user.incrementLoginAttempts();
      throw new ErrorHandler("Invalid Email or Password", 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
    }

    return user;
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ErrorHandler(
        "Email verification token is invalid or has expired",
        400
      );
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();
    return user;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new ErrorHandler("Refresh token is required", 401);
    }

    try {
      const decodedData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decodedData.id);

      if (!user) {
        throw new ErrorHandler("User not found", 404);
      }

      const newAccessToken = user.getJWTToken();
      return { user, accessToken: newAccessToken };
    } catch (error) {
      throw new ErrorHandler("Invalid refresh token", 401);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (user.isVerified) {
      throw new ErrorHandler("Email is already verified", 400);
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking on the following link:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create this account, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification - Doctor Appointment",
        message,
      });

      return { success: true, message: `Verification email sent to ${user.email}` };
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ErrorHandler(error.message, 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    return user;
  }

  /**
   * Get all users (Admin)
   */
  async getAllUsers() {
    const users = await User.find();
    return users;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const newUserData = {
      name: updateData.name,
      email: updateData.email,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    return updatedUser;
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);

    if (!isPasswordMatched) {
      throw new ErrorHandler("Old Password does not match", 400);
    }

    if (newPassword === oldPassword) {
      throw new ErrorHandler(
        "New Password must be different from the old password",
        400
      );
    }

    // Validate new password format
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(newPassword)) {
      throw new ErrorHandler(
        "Password must be at least 8 characters long, contain at least one number, one uppercase and lowercase letter, and one special character",
        400
      );
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  /**
   * Update user role (Admin)
   */
  async updateUserRole(userId, role) {
    const newUserData = {
      role: role,
    };

    const user = await User.findByIdAndUpdate(userId, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      throw new ErrorHandler(`User Does not exist with id: ${userId}`, 404);
    }

    return user;
  }

  /**
   * Delete user (Admin)
   */
  async deleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler(`User does not exist with Id : ${userId}`, 404);
    }

    await user.deleteOne();
    return user;
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ErrorHandler("user Not Found", 404);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `your password reset token is:-\n\n${resetPasswordUrl}\n\nif this email is not yours, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Doctor Appointment Password Recovery",
        message,
      });

      return { success: true, message: `Email sent to ${user.email} successfully` };
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new ErrorHandler(error.message, 500);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, password, confirmPassword) {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ErrorHandler(
        "reset password token is invalid or has been expired",
        404
      );
    }

    if (password !== confirmPassword) {
      throw new ErrorHandler("Password does not match", 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return user;
  }
}

export default new UserService();
