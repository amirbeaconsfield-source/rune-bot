export default {
  name: "ping",
  description: "Check bot responsiveness",

  async execute({ interaction }) {
    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      content: `Pong! 🏓 In ${latency}ms.`,
    });
  },
};
