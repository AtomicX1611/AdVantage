
export const errorMiddleware = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const timestamp = new Date().toISOString();
    const requestPath = req.path;
    const requestMethod = req.method;

    console.error("ERROR CAUGHT BY ERROR MIDDLEWARE");
    console.error(`Timestamp: ${timestamp}`);
    console.error(`Path: ${requestMethod} ${requestPath}`);
    console.error(`Status Code: ${status}`);
    console.error(`Message: ${message}`);
    console.error(`Error Type: ${err.name || "Unknown"}`);
    
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
            errorType: err.name,
        }),
    });
};