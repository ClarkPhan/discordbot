import * as dotenv from 'dotenv';
import { fetchStock } from './stock';
import { Client, MessageAttachment } from 'discord.js';

dotenv.config();
const client = new Client();
const PREFIX = '!';
const MAX_ARGS = 2;

client.on('ready', () => {
	console.log(`${client.user.tag} has logged in.`);
});

client.on('message', (message) => {
	if (!message.content.startsWith(PREFIX) || message.author.bot) return;
	const [CMD_NAME, ...args] = message.content
		.trim()
		.substring(PREFIX.length)
		.split(/\s+/);
	if (CMD_NAME === 'stock') {
		if (args.length === 0) {
			return message.reply('Please provide stock id, pepelaugh.');
		} else if (args.length > MAX_ARGS) {
			const attachment = new MessageAttachment('./media/kekbomb.gif');
			message.reply('*Pepelaugh OH NO NO NO* I can only accept up to **2** stock symbols!', attachment);
		} else {
			args.forEach(symbol => fetchStock(message, symbol));
		}
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);