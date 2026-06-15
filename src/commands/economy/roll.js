import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../modules/numberFormatter.js';
import { rngPick } from '../../modules/rngPick.js';
import { giveItem } from '../../modules/inventoryHandler.js';
import { sendSched, sendReply } from '../../modules/sendReply.js';
import { checkCooldown, setCooldown } from '../../modules/cooldownHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadItemConfig() {
	const configPath = join(__dirname, '../../item-config.json');
	const raw = await readFile(configPath, 'utf8');
	return JSON.parse(raw);
}

export default {
	name: 'roll',
	description: 'Roll a random rune',
	cooldownMs: 10000,
	async execute({ interaction }) {
		const userId = interaction.user.id;

		const cooldownStatus = await checkCooldown(userId, 'roll');
		if (cooldownStatus.isOnCooldown) {
			return sendReply(interaction, {
				content: `⏳ You're on cooldown. Try again in ${cooldownStatus.remainingSecs}s.`,
				flags: 64,
			});
		}

		const config = await loadItemConfig();
		const runes = Array.isArray(config.runes) ? config.runes : [];

		if (runes.length === 0) {
			return sendReply(interaction, {
				content: 'No runes are configured at this time.',
			});
		}

		const selectedRune = rngPick(runes, 'chance');
		if (!selectedRune) {
			return sendReply(interaction, {
				content: 'Could not determine a rune. Please try again later.',
			});
		}

		await giveItem(userId, {
			name: selectedRune.name,
			rarity: selectedRune.rarity,
			luckBoost: selectedRune.luckBoost,
			chance: selectedRune.chance,
			sellPrice: selectedRune.sellPrice,
		});

		await setCooldown(userId, 'roll', this.cooldownMs);

		let color;

		switch (selectedRune.rarity) {
			case 'Common':
				color = 0x808080; // gray
				break;
			case 'Uncommon':
				color = 0x5865f2; // blurple
				break;
			case 'Rare':
				color = 0x0000ff; // blue
				break;
			case 'Legendary':
				color = 0xffff00; // yellow
				break;
			case 'Mythic':
				color = 0xff0000; // red
				break;
			case 'Cosmic':
				color = 0x000000; // black
				break;
			default:
				color = 0x808080; // default gray
				break;
		}

		const embed = new EmbedBuilder()
			.setTitle(`🎲 You rolled a ${selectedRune.rarity} Rune!`)
			.setDescription(selectedRune.name)
			.setColor(color)
			.setFooter({ text: `rolled by ${interaction.user.username}` })
			.addFields(
				{
					name: 'Odds',
					value:
						!selectedRune.chance || selectedRune.chance <= 0
							? 'Unknown odds'
							: `1 in ${formatNumber(Math.round(selectedRune.chance))}`,
					inline: true,
				},
				{
					name: 'Luck Boost',
					value: `+${selectedRune.luckBoost}`,
					inline: true,
				},
				{
					name: 'Sell Price',
					value: `${formatNumber(selectedRune.sellPrice)} cash`,
					inline: false,
				},
			);

		return sendSched(
			interaction,
			{ content: '🎲 Rolling Rune...' },
			{ embeds: [embed] },
			3000,
		);
	},
};
