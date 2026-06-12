import mongoose from "mongoose";

const cooldownSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    commandName: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Index to auto-delete expired cooldowns
cooldownSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cooldown =
  mongoose.models.Cooldown || mongoose.model("Cooldown", cooldownSchema);
