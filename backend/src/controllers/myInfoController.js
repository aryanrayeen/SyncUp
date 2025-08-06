import Infos from '../models/Infos.js';

// Get the latest info
export const getInfo = async (req, res) => {
    try {
        const info = await Infos.findOne().sort({ date: -1 });
        res.status(200).json(info);
    } catch (error) {
        console.error('Error in getInfo:', error);
        res.status(500).json({ message: 'Failed to fetch info' });
    }
};

// Create or update info
export const updateInfo = async (req, res) => {
    try {
        const { age, height, weight, caloriesIntake, exerciseMinutes } = req.body;

        // Validate required fields
        if (!age || !height || !weight || !caloriesIntake || !exerciseMinutes || !monthlyBudget) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new info entry
        const info = new Infos({
            age,
            height,
            weight,
            caloriesIntake,
            exerciseMinutes,
            monthlyBudget
        });

        await info.save();
        res.status(201).json(info);
    } catch (error) {
        console.error('Error in updateInfo:', error);
        res.status(500).json({ message: 'Failed to update Info' });
    }
};