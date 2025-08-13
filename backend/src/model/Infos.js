import mongoose from 'mongoose';

const infoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    caloriesIntake: {
        type: Number,
        required: true
    },
    exerciseMinutes: {
        type: Number,
        required: true
    },
    monthlyBudget: {
        type: Number,
        required: true
    },
    bmi: {
        type: Number,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Infos = mongoose.model('Infos', infoSchema);

export default Infos;