import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
    }

    req.userId = decoded.id;
    console.log("✅ req.userId set to:", req.userId);
    next();
  } catch (error) {
    console.log("❌ Error in verifyToken:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
