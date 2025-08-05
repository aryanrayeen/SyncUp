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
		userType: {
			type: String,
			required: true,
			enum: ['ngo', 'individual', 'restaurant'],
			default: 'individual'
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);