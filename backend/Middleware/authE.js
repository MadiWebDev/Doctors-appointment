import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import jwt from "jsonwebtoken";


 export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  if (!req.cookies) {
    return next(new ErrorHandler("No cookies found", 401));
  }
  const token = req.cookies.token;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
  next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token, please login again", 401));
  }
});

export const authrizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource `
        )
      );
    }
    next();
  };
};
 
 