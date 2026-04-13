const jwt = require("jsonwebtoken");

// 1. Verify Token: Check if the user is logged in
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/auth/login?error=Access Denied. Please Login.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Token payload (id aur role) ko req object me store karte hain
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/auth/login?error=Invalid Session");
  }
};

// 2. Verify User: Check if the role is 'user' or 'admin'
const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "user") {
      next();
    } else {
      res.clearCookie("token");
      return res.status(403).redirect("/auth/login?error=Unauthorized Access");
    }
  });
};

// 3. Verify Admin: Check if the role is strictly 'admin'
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      // Agar admin nahi hai toh home ya user page par redirect kar sakte hain
      res.clearCookie("token");
      return res
        .status(403)
        .redirect("/auth/login?error=Admin Access Required");
    }
  });
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyAdmin,
};
