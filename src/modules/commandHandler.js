import {
  Collection,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { readdir } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, extname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CommandHandler {
  constructor(options = {}) {
    this.slashCommands = new Collection();
    this.commandsDir = options.commandsDir || `${__dirname}/../commands`;
    this.guildId = options.guildId || null;
  }

  buildSlashCommand(command) {
    const builder = new SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description || "No description provided");

    if (command.slash?.options) {
      command.slash.options.forEach((option) => {
        switch (option.type) {
          case "string":
            builder.addStringOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
          case "number":
            builder.addNumberOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
          case "user":
            builder.addUserOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
          case "role":
            builder.addRoleOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
          case "channel":
            builder.addChannelOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
          case "boolean":
            builder.addBooleanOption((opt) =>
              opt
                .setName(option.name)
                .setDescription(option.description || "")
                .setRequired(option.required ?? false),
            );
            break;
        }
      });
    }

    if (command.permissions) {
      const perms = Array.isArray(command.permissions)
        ? command.permissions[0]
        : command.permissions;
      builder.setDefaultMemberPermissions(perms);
    }

    return builder;
  }

  registerCommand(command) {
    if (!command.name || !command.execute) return;

    const slashCommand = {
      data: this.buildSlashCommand(command),
      execute: command.execute,
      permissions: command.permissions,
    };

    this.slashCommands.set(command.name, slashCommand);
  }

  async load(directory = this.commandsDir) {
    const files = await readdir(directory, { recursive: true });
    const jsFiles = files.filter((file) => {
      const ext = extname(file);
      return ext === ".js" && !file.includes("node_modules");
    });

    let loadedCount = 0;
    for (const file of jsFiles) {
      try {
        const fullPath = `${directory}/${file}`;
        const modulePath = `file://${fullPath}`;
        const imported = await import(modulePath);
        const command = imported.default;

        if (!command) continue;

        this.registerCommand(command);
        loadedCount++;
      } catch (error) {
        console.error(`Error loading command from ${file}:`, error);
      }
    }

    return loadedCount;
  }

  async deploy(client) {
    if (this.slashCommands.size === 0) return;

    const commands = this.slashCommands.map((cmd) => cmd.data.toJSON());
    const rest = new REST({ version: "10" }).setToken(client.token);

    if (this.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, this.guildId),
        { body: commands },
      );
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
    }
  }

  attachClient(client) {
    this.client = client;

    client.once("clientReady", async () => {
      try {
        await this.load();
        await this.deploy(client);
      } catch (error) {
        console.error("Error initializing commands:", error);
      }
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute({ interaction, client });
      } catch (error) {
        console.error(
          `Error executing slash command ${interaction.commandName}:`,
          error,
        );
        const errorMessage =
          "❌ An error occurred while executing this command";

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage });
        } else {
          await interaction.reply({
            content: errorMessage,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    });
  }
}
