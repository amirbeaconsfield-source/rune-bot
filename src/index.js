import { Client, IntentsBitField, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import { CommandHandler } from './modules/commandHandler.js';
import { DatabaseHandler } from './modules/databaseHandler.js';

dotenv.config();

const db = new DatabaseHandler({
	mongoUri: process.env.MONGO_URI,
});

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.DirectMessages,
	],
});

const handler = new CommandHandler({
	guildId: process.env.GUILD_ID || null,
});

handler.attachClient(client);

client.once('clientReady', async () => {
	console.log(`✅ Logged in as ${client.user.tag}!`);

	await db.connect();

	client.user.setActivity({
		name: 'Made with ❤️',
		type: ActivityType.Playing,
	});
});

client.login(process.env.TOKEN).catch((error) => {
	console.error('Error logging in:', error);
	process.exit(1);
});

process.on('SIGINT', async () => {
	console.log('\n🛑 Shutting down gracefully...');
	await db.disconnect();
	await client.destroy();
	process.exit(0);
});
