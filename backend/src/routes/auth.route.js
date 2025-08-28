import express from "express";
import {
    login,
    logout,
    signup,
    checkAuth,
} from "../controllers/authCont.js";
import { updateUserProfile, getUserProfile } from "../controllers/myInfoController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Get user profile (name, email, phone, location)
router.get("/profile", verifyToken, getUserProfile);
// Update user profile (name, email, phone, location)
router.put("/profile", verifyToken, updateUserProfile);

export default router;