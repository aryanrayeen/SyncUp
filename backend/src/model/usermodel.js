import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			default: '',
		},
		location: {
			type: String,
			default: '',
		},
		profilePicture: {
			type: String,
			default: null,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);