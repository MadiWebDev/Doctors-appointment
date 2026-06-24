import ErrorHandler from "../utilis/errorHandler.js";

export const errorMiddleWare = (err, req, res, next) => {
 err.statusCode = err.statusCode || 500;
 err.message = err.message || "Internal Server Error";

 // Wrong MongoDB ID error
 if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
 }

 // Mongoose duplicate key error
 if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;   
    err = new ErrorHandler(message, 400);
 }

 // Wrong JWT error
 if (err.name === "JsonWebTokenError") {
    const message = `JSON Web token is invalid, try again`;
    err = new ErrorHandler(message, 400);
 }

 // JWT token expired
 if (err.name === "TokenExpiredError") {
    const message = `JSON Web token is expired, try again`;
    err = new ErrorHandler(message, 400);
 }

 // Send the error response
 res.status(err.statusCode).json({
    success: false,
    error: err.message,
 });
};

// export const errorMiddleWare = (err, req, res, next) => {
//     let error = {
//        message: err.message || "Internal Server Error",
//        statusCode: err.statusCode || 500,
//     };
   
//     // Wrong MongoDB ID error
//     if (err.name === "CastError") {
//        error.message = `Resource not found. Invalid: ${err.path}`;
//        error.statusCode = 400;
//     }
   
//     // Mongoose duplicate key error
//     else if (err.code === 11000) {
//        error.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
//        error.statusCode = 400;
//     }
   
//     // Wrong JWT error
//     else if (err.name === "JsonWebTokenError") {
//        error.message = `JSON Web token is invalid, try again`;
//        error.statusCode = 400;
//     }
   
//     // JWT token expired
//     else if (err.name === "TokenExpiredError") {
//        error.message = `JSON Web token is expired, try again`;
//        error.statusCode = 400;
//     }
   
//     // Send the error response
//     res.status(error.statusCode).json({
//        success: false,
//        error: error.message,
//     });
//    };
   