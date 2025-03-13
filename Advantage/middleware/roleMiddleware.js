export const requireRole = (role) => {
    return (req, res, next) => {
      console.log("User role : ",req.user.role)
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not logged in" });
      }
      if (req.user.role !== role) {
        return res.status(403).json({ error: `Access denied: ${role}s only` });
      }
      next();
    };
  };