export async function sendReply(interaction, options) {
	return interaction.reply(options);
}

export async function sendSched(
	interaction,
	initialOptions,
	editOptions,
	delayMs = 3000,
) {
	const message = await interaction.reply({
		...initialOptions,
		fetchReply: true,
	});

	setTimeout(() => {
		message.edit(editOptions).catch((err) => console.error(err.message));
	}, delayMs);

	return message;
}
