import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		userID: { type: String, required: true, unique: true },
		inventory: { type: Array, default: [] },
		runeSlots: { type: Number, default: 0 },
		luckBoosts: { type: Number, default: 0 },
		cash: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
