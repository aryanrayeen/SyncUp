console.log("🔥 AUTH CONTROLLER LOADED");
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../model/usermodel.js";



// =======================
// Signup Controller
// =======================
export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	console.log("🔐 Signup attempt:", { email, password });

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		const user = new User({
			email,
			password: hashedPassword,
			name,
		});

		await user.save();

		// Set token in cookie
		generateTokenAndSetCookie(res, user._id);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.error("Error in signup:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// =======================
// Login Controller
// =======================
export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		// Generate token for response
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
		console.log("Generated token:", token);
		
		// Set token in cookie
		generateTokenAndSetCookie(res, user._id);

		// Update last login time
		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
  			success: true,
  			message: "Logged in successfully",
  			user: {
    			_id: user._id,
    			name: user.name,
    			email: user.email,
  	},
  				token: token || "TOKEN_NOT_SET", // Fallback for debugging
});
	} catch (error) {
		console.error("Error in login:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// =======================
// Logout Controller
// =======================
export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

// =======================
// Check Auth Controller
// =======================
export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error in checkAuth:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
