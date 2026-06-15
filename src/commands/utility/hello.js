export default {
	name: 'hello',
	description: 'Say hello to the bot',

	async execute({ interaction }) {
		await interaction.reply({
			content: `Hello, ${interaction.user.username}! 👋`,
		});
	},
};
