import jwt from "jsonwebtoken";

export const serializeUser = (req, res, next) => {
    // console.log('Logging in serializeUser with token : ',req.cookies.token);
  const token = req.cookies?.token;

  if (!token) {
    console.log('ERROR: No token provided to serializeUser');
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('ERROR: Could not verify token');
      return res.sendStatus(403);
    }
    req.user = decoded;  // req.user._id for userId
    next();
  });
};

export const checkToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(403).json({
      error: "token not provided"
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