 
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
  resetPassword,

} from "../Controllers/userControllers.js";
import { authrizeRole, isAuthenticatedUser } from "../Middleware/authE.js";
const userRoute = express.Router();


// Add this middleware to your routes that handle file uploads
userRoute.route('/register').post( registerUser);
userRoute.route("/logIn").post(logIn);
userRoute.route("/password/forgot").post(forgetPassword);
userRoute.route("/password/reset/:token").put(resetPassword);
userRoute.route("/logOut").get(logOut); 
userRoute.route("/details").get(isAuthenticatedUser, GetUserDetails);
userRoute.route("/password/update").put(isAuthenticatedUser,   UpdatePassword);
userRoute
  .route("/profile/update")
  .put( isAuthenticatedUser, UpdateProfile);

userRoute
  .route("/admin/allUsers")
  .get(isAuthenticatedUser, authrizeRole("admin"), getAllUsers);

userRoute
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authrizeRole("admin"), getSingleUser)
  .put(isAuthenticatedUser, authrizeRole("admin"), UpdateUserRole)
  .delete(isAuthenticatedUser, authrizeRole("admin"), deleteUser);

export default userRoute;
