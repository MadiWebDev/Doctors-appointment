const sendToken = (user, statusCode, res) => {
  try {
     const token = user.getJWTToken();
 
     // Validate environment variable
     const cookieExpire = process.env.COOKIE_EXPIRE;
     if (!cookieExpire) {
       throw new Error("COOKIE_EXPIRE environment variable is not set.");
     }
 
     // Convert COOKIE_EXPIRE from days to milliseconds
     const expireTime = parseInt(cookieExpire, 10) * 24 * 60 * 60 * 1000;
 
     // Options for cookie
     const options = {
       expires: new Date(Date.now() + expireTime),
       httpOnly: true,
       secure: process.env.NODE_ENV !== "development", // Set secure to true in production
     };
 
     // Set the cookie with the token
     res.status(statusCode).cookie("token", token, options).json({
       success: true,
       user,
       token,
     });
  } catch (error) {
     // Log the error for debugging
     console.error("Error sending token:", error);
 
     // Send a response with an error message
     res.status(500).json({ success: false, message: "Internal server error" });
  }
 };
 
 export default sendToken;
 