import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token = null;

  console.log("=== Token Verification Debug ===");
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("Token found in Authorization header");
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log("Token found in cookies");
  }

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded || (!decoded.id && !decoded.userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
    }

    // Handle both possible token formats
    req.userId = decoded.userId || decoded.id;
    console.log("req.userId set to:", req.userId);
    next();
  } catch (error) {
    console.log("Error in verifyToken:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export default verifyToken;
