import { EmbedBuilder, Colors } from "discord.js";
import { getInventory } from "../../modules/inventoryHandler.js";
import { sendReply } from "../../modules/sendReply.js";
import { formatNumber } from "../../modules/numberFormatter.js";

// Hello World

export default {
  name: "inventory",
  description: "Display your current rune inventory",

  async execute({ interaction }) {
    const userId = interaction.user.id;
    const inventory = await getInventory(userId);

    if (!inventory.length) {
      return sendReply(interaction, {
        content: "Your inventory is empty.",
      });
    }

      const groupedItems = inventory.reduce((map, item) => {
      const key = `${item.name}|${item.rarity ?? "Unknown"}|${item.sellPrice ?? 0}`;

      if (!map.has(key)) {
        map.set(key, {
          name: item.name,
          rarity: item.rarity ?? "Undefined",
          sellPrice: item.sellPrice ?? 0,
          count: 0,
        });
      }

      const grouped = map.get(key);
      grouped.count += 1;
      return map;
    }, new Map());

    const runes = Array.from(groupedItems.values()).map((item) => {
      const valueText = formatNumber(item.sellPrice);
      return `(${item.count})x ${item.name} [${item.rarity}] [${valueText}]`;
    });

    const totalValue = inventory.reduce((sum, item) => sum + (item.sellPrice ?? 0), 0);

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setDescription(`Here are your collected runes:`)
      .setColor(Colors.Blue)
      .setFooter({ text: `Total value of inventory: ${formatNumber(totalValue)}` })
      .addFields({
        name: "Runes",
        value: runes.join("\n"),
      });

    return sendReply(interaction, { embeds: [embed] });
  },
};
