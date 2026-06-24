class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Ensure the name of the error is set to the name of the class
        this.name = this.constructor.name;

        // Capture the stack trace excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;
