import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	console.log("Setting cookie with token for userId:", userId);
	
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Changed to lax for development
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	console.log("Cookie set successfully");
	return token;
};