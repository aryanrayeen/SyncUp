import Infos from '../model/Infos.js';
import { User } from '../model/usermodel.js';

// Get user's information
export const getUserInfo = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("Getting user info for userId:", userId);
        
        // Find the most recent info for this user
        const userInfo = await Infos.findOne({ userId }).sort({ date: -1 });
        
        if (!userInfo) {
            console.log("No user info found for userId:", userId);
            return res.status(404).json({ 
                success: false, 
                message: "No information found. Please complete your profile first." 
            });
        }

        console.log("User info found:", userInfo);
        res.status(200).json({
            success: true,
            data: userInfo
        });
    } catch (error) {
        console.error("Error in getUserInfo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch user information" 
        });
    }
};

// Create or update user information
export const updateUserInfo = async (req, res) => {
    try {
        const userId = req.userId;
        const { age, height, weight, caloriesIntake, exerciseMinutes, monthlyBudget } = req.body;
        
        console.log("Updating user info for userId:", userId);
        console.log("Request body:", req.body);

        // Validate required fields
        if (!age || !height || !weight || !caloriesIntake || !exerciseMinutes || !monthlyBudget) {
            console.log("Missing required fields");
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Calculate BMI
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        console.log("Calculated BMI:", bmi);

        // Check if user info already exists
        const existingInfo = await Infos.findOne({ userId });

        if (existingInfo) {
            // Update existing info
            const updatedInfo = await Infos.findOneAndUpdate(
                { userId },
                {
                    age,
                    height,
                    weight,
                    caloriesIntake,
                    exerciseMinutes,
                    monthlyBudget,
                    bmi,
                    date: new Date()
                },
                { new: true }
            );

            console.log("Profile completion status: true");
            return res.status(200).json({
                success: true,
                message: "Information updated successfully",
                data: updatedInfo
            });
        } else {
            // Create new info
            const newInfo = new Infos({
                userId,
                age,
                height,
                weight,
                caloriesIntake,
                exerciseMinutes,
                monthlyBudget,
                bmi,
                date: new Date()
            });

            await newInfo.save();

            console.log("Profile completion status: true");
            return res.status(201).json({
                success: true,
                message: "Information saved successfully",
                data: newInfo
            });
        }
    } catch (error) {
        console.error("Error in updateUserInfo:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save user information"
        });
    }
};

// Check if user has completed their profile
export const checkProfileCompletion = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("Checking profile completion for userId:", userId);
        
        const userInfo = await Infos.findOne({ userId });
        const isComplete = !!userInfo;
        
        console.log("User info found:", userInfo ? "YES" : "NO");
        if (userInfo) {
            console.log("User info details:", {
                age: userInfo.age,
                height: userInfo.height,
                weight: userInfo.weight,
                caloriesIntake: userInfo.caloriesIntake,
                exerciseMinutes: userInfo.exerciseMinutes,
                monthlyBudget: userInfo.monthlyBudget
            });
        }
        console.log("Profile completion status:", isComplete);
        
        res.status(200).json({
            success: true,
            isComplete: isComplete
        });
    } catch (error) {
        console.error("Error in checkProfileCompletion:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check profile completion"
        });
    }
};

// Get user profile information
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("Getting user profile for userId:", userId);
        
        // Find user profile data
        const user = await User.findById(userId).select('-password'); // Exclude password
        
        if (!user) {
            console.log("User not found for userId:", userId);
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log("User profile found:", user);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch user profile" 
        });
    }
};

// Update user profile information
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, phone, location, profilePicture } = req.body;
        
        console.log("Updating user profile for userId:", userId);
        console.log("Request body:", req.body);

        // Validate required fields
        if (!name || name.trim() === '') {
            console.log("Name is required");
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // Prepare update object
        const updateData = {
            name: name.trim(),
            updatedAt: new Date()
        };

        // Add optional fields if provided
        if (email && email.trim() !== '') {
            updateData.email = email.trim();
        }
        if (phone && phone.trim() !== '') {
            updateData.phone = phone.trim();
        }
        if (location && location.trim() !== '') {
            updateData.location = location.trim();
        }
        if (profilePicture !== undefined) {
            updateData.profilePicture = profilePicture;
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password'); // Exclude password from response

        if (!updatedUser) {
            console.log("User not found");
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("User profile updated successfully:", updatedUser);
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update user profile" 
        });
    }
};