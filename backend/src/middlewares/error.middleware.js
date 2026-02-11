import { errorLogStream } from "../../app.js";

export const errorMiddleware = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const timestamp = new Date().toISOString();
    const requestPath = req.path;
    const requestMethod = req.method;
    const errorType = err.name || "Unknown";

    // Build log entry for error.log
    const logEntry = [
        `[${timestamp}]`,
        `${requestMethod} ${requestPath}`,
        `Status: ${status}`,
        `Type: ${errorType}`,
        `Message: ${message}`,
        err.details ? `Details: ${JSON.stringify(err.details)}` : null,
        err.stack ? `Stack: ${err.stack}` : null,
    ]
        .filter(Boolean)
        .join(" | ");

    // Write to rotating error.log file
    errorLogStream.write(logEntry + "\n");

    // Console output (dev convenience)
    console.error("ERROR CAUGHT BY ERROR MIDDLEWARE");
    console.error(`Timestamp: ${timestamp}`);
    console.error(`Path: ${requestMethod} ${requestPath}`);
    console.error(`Status Code: ${status}`);
    console.error(`Message: ${message}`);
    console.error(`Error Type: ${errorType}`);
    
    if (err.stack) {
        console.error("Stack Trace:");
        console.error(err.stack);
    }
    
    if (err.details) {
        console.error(`Details: ${JSON.stringify(err.details, null, 2)}`);
    }

    // Client response
    res.status(status).json({
        success: false,
        message: message,
        status: status,
        timestamp: timestamp,
        path: requestPath,
        method: requestMethod,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            errorType: errorType,
        }),
    });
};