import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";
import sendToken from "../utilis/jwtToken.js";
import crypto from "crypto";
import sendEmail from "../utilis/sendEmail.js";
import catchAsyncError from "../Middleware/catchAsyncError.js";

//*** Register User  **//
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmPassword, username } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Validate email
  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  // Validate password
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!regex.test(password)) {
  return next(
    new ErrorHandler(
      "Password must be at least 8 characters long, contain at least one number, one uppercase and lowercase letter, and one special character"
    )
  );
}

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return next(new ErrorHandler("Username already exists", 400));
  }

  const user = await User.create({
    email,
    password,
    username,
  });

  if (!user) {
    return next(new ErrorHandler("Internal server error", 500));
  }

  res.status(201).json({ success: true, user });
});

/** LogIn User **/
export const logIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email or Password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  sendToken(user, 201, res);
});

//*** LogOut User ***/
export const logOut = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logged Out Successfully",
  });
});

//*** forget Password ***/
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user Not Found", 404));
  }

  // Get Reset Password token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`;

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `your password reset token is:-\n\n${resetPasswordUrl}\n\nif this email is not yours, please ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "eccomerce Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.error("Error sending email:", error);
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//** get reset password **//
export const resetPassword = catchAsyncError(async (req, res, next) => {
  /**creating token hash **/

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "reset password token is invalid or has been expired",
        404
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//** Get User Details **/
export const GetUserDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new ErrorHandler("User ID is missing", 401));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//** Update Password **/
export const UpdatePassword = catchAsyncError(async (req, res, next) => {
  try {
    // Ensure the request body contains the necessary fields
    if (!req.body.oldPassword || !req.body.newPassword) {
      return next(
        new ErrorHandler("Please provide old and new passwords", 400)
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old Password does not match", 400));
    }

    if (req.body.newPassword === req.body.oldPassword) {
      return next(
        new ErrorHandler(
          "New Password must be different from the old password",
          400
        )
      );
    }

    user.password = req.body.newPassword;
    await user.save();

    // Assuming sendToken is a function that sends a token to the client
    sendToken(user, 200, res);
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    // Send a generic error response
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

//** Update user profile **/
export const UpdateProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const newUserData = {
    username: req.body.username,
    email: req.body.email,
  };

  const updatedUser = await User.findByIdAndUpdate(userId, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, updatedUser });
});

/** Get All Users (Admin)**/
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//** Get One User Details (Admin) **/
export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User Does not exist with id:  ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

/** update user role -Admin   **/
export const UpdateUserRole = catchAsyncError(async (req, res, next) => {
  // Check if the current user is an admin
  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler("Forbidden: Only admins can update user roles", 403)
    );
  }

  const newUserData = {
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});
//** Delete User ---Admin  **/
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});
