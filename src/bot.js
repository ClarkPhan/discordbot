require('dotenv').config();

const stock = require('./stock.js');
const { Client } = require('discord.js');
const client = new Client();
const PREFIX = '!';

client.on('ready', () => {
	console.log(`${client.user.tag} has logged in.`);
})

client.on('message', (message) => {
	if (message.author.bot) return;
	if (message.content.startsWith(PREFIX)) {
		const [CMD_NAME, ...args] = message.content
			.trim()
			.substring(PREFIX.length)
			.split(/\s+/);
		if (CMD_NAME === 'stock') {
			if (args.length === 0) {
				return message.reply('Please provide stock id, pepelaugh.');
			}
			args.forEach(symbol => {
				stock.fetchStock(message, symbol);
			})
		}
	}
})

client.login(process.env.DISCORD_BOT_TOKEN);