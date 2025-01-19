export const ErrorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal server error");
    err.statusCode || (err.statusCode = 500);
    console.log('error found :: ');
    if (err.message.includes('Cast to ObjectId failed')) {
        return res.status(err.statusCode).json({
            success: false,
            message: 'Invalid Object ID',
        });
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
export const TryCatch = (func) => {
    return (req, res, next) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    };
};
