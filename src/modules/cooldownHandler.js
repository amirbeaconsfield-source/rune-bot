import { Cooldown } from '../schemas/cooldown.js';

export async function checkCooldown(userId, commandName) {
	const cooldown = await Cooldown.findOne({
		userID: userId,
		commandName,
		expiresAt: { $gt: new Date() },
	});

	if (cooldown) {
		const remainingMs = cooldown.expiresAt - new Date();
		const remainingSecs = Math.ceil(remainingMs / 1000);
		return {
			isOnCooldown: true,
			remainingSecs,
		};
	}

	return {
		isOnCooldown: false,
		remainingSecs: 0,
	};
}

export async function setCooldown(userId, commandName, cooldownMs) {
	const expiresAt = new Date(Date.now() + cooldownMs);

	await Cooldown.deleteMany({
		userID: userId,
		commandName,
	});

	await Cooldown.create({
		userID: userId,
		commandName,
		expiresAt,
	});
}
