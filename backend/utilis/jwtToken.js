const sendToken = (user, statusCode, res) => {
  try {
     const accessToken = user.getJWTToken();
     const refreshToken = user.getRefreshToken();

     // Validate environment variable
     const cookieExpire = process.env.COOKIE_EXPIRE;
     if (!cookieExpire) {
       throw new Error("COOKIE_EXPIRE environment variable is not set.");
     }

     // Convert COOKIE_EXPIRE from days to milliseconds
     const expireTime = parseInt(cookieExpire, 10) * 24 * 60 * 60 * 1000;

     const isProduction = process.env.NODE_ENV === "production";

     // Options for access token cookie (shorter lived)
     const accessTokenOptions = {
       expires: new Date(Date.now() + expireTime),
       httpOnly: true,
       secure: isProduction,           // must be true for sameSite: 'none'
       sameSite: isProduction ? "none" : "lax", // 'none' allows cross-domain cookies
     };

     // Options for refresh token cookie (longer lived)
     const refreshTokenOptions = {
       expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
       httpOnly: true,
       secure: isProduction,
       sameSite: isProduction ? "none" : "lax",
     };

     // Set both cookies
     res.status(statusCode)
       .cookie("accessToken", accessToken, accessTokenOptions)
       .cookie("refreshToken", refreshToken, refreshTokenOptions)
       .json({
       success: true,
       user,
       accessToken,
     });
  } catch (error) {
     // Log the error for debugging
     console.error("Error sending token:", error);

     // Send a response with an error message
     res.status(500).json({ success: false, message: "Internal server error" });
  }
 };

 export default sendToken;
 