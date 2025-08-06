import mongoose from 'mongoose';

const infoSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now
    }
});

const Infos = mongoose.model('Infos', infoSchema);

export default Infos;