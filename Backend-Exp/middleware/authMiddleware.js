import jwt from "jsonwebtoken";

function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    let token = req.header("Authorization");
    
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      
      // Role-based authorization check
      if (allowedRoles.length > 0 && !allowedRoles.includes(verified.role)) {
        return res.status(403).json({ 
          msg: "Access denied. Insufficient permissions.",
          requiredRoles: allowedRoles,
          userRole: verified.role
        });
      }
      
      next();
    } catch (err) {
      res.status(400).json({ msg: "Token is not valid" });
    }
  };
}

export default authMiddleware;