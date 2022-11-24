import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { REST, Routes } from 'discord.js';

// Load environment variables
dotenv.config();

export default function deployCommands() {
	// Read command files
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

	// Array to store command data
	const commands = [];

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

	// Deploy commands
	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);
			// PUT method is used to fully refresh all commands in the guild
			const response = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
				{ body: commands },
			);
			if (response) {
				console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
			}
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	})();
}

