console.log("AUTH CONTROLLER LOADED");
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"; // added this
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../model/usermodel.js";

export const signup = async (req, res) => {
	console.log("=== SIGNUP REQUEST ===");
	console.log("Request body:", req.body);
	
	const { email, password, name } = req.body;

	try {
		console.log("Checking fields:", { email: !!email, password: !!password, name: !!name });
		
		if (!email || !password || !name) {
			console.log("Missing required fields");
			throw new Error("All fields are required");
		}

		console.log("Checking if user exists for email:", email);
		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			console.log("User already exists, returning 400");
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		console.log("Hashing password...");
		const hashedPassword = await bcryptjs.hash(password, 10);

		console.log("Creating user object...");
		const user = new User({
			email,
			password: hashedPassword,
			name,
		});

		console.log("Saving user to database...");
		await user.save();
		console.log("User saved successfully with ID:", user._id);

		// Generate JWT token and set cookie
		console.log("Generating token and setting cookie...");
		generateTokenAndSetCookie(res, user._id);

		console.log("Sending success response...");
		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in signup:", error.message);
		console.log("Full error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

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

		// Set cookie - this will generate the token with the correct format
		const token = generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				location: user.location,
				profilePicture: user.profilePicture,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			token, // token is now defined and included
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		console.log("checkAuth - User data:", {
			_id: user._id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			location: user.location,
			profilePicture: user.profilePicture ? 'Present' : 'Not present'
		});

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
