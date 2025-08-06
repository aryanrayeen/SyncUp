import express from "express";
import {
	login,
	logout,
	signup,
	checkAuth,
} from "../controllers/authCont.js";
import { updateUserProfile } from "../controllers/myInfoController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Update user profile (name, etc.)
router.put("/profile", verifyToken, updateUserProfile);

export default router;