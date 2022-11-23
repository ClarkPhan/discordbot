import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import deployCommands from './deploy-commands';

import {
	Client,
	Collection,
	GatewayIntentBits,
} from 'discord.js';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	],
});

client.commands = new Collection();

// Reading command files
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

// Reading event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

// Initialize commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	console.log(filePath);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Initialize events
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	console.log(filePath);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Deploy server commands
deployCommands();

client.login(process.env.DISCORD_BOT_TOKEN);