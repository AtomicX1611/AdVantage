import jwt from "jsonwebtoken";

export const serializeUser = (req, res, next) => {
    console.log('Logging in backend with token : ',req.cookies.token);
    
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('ERROR: Could not verify token');
            return res.sendStatus(403);
        }
        console.log(decoded);
        req.user = decoded;
        next();
    });
};

export const checkToken = (req, res, next) => {
    console.log("req.cookies: ",req.cookies);
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(403).json({
            error: "token not there in cookies"
        });
    }
    req.token = token;
    next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};