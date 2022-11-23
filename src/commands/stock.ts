import { SlashCommandBuilder } from 'discord.js';
import { fetchStock } from '../stock';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stock')
		.setDescription('Replies with the current stock price.')
		.addStringOption(option =>
			option.setName('symbol')
				.setDescription('The stock ticker symbol')
				.setRequired(true)),
	async execute(interaction) {
		const symbol = interaction.options.getString('symbol') ?? 'No symbol provided';
		await fetchStock(interaction, symbol.toUpperCase());
	},
};

// client.on(Events.MessageCreate, interaction => {
// 	console.log(interaction);
// 	// console.log('message', message);
// 	// if (!message.content.startsWith(PREFIX) || message.author.bot) return;
// 	// const [CMD_NAME, ...args] = message.content
// 	// 	.trim()
// 	// 	.substring(PREFIX.length)
// 	// 	.split(/\s+/);
// 	// if (CMD_NAME === 'stock') {
// 	// 	if (args.length === 0) {
// 	// 		return message.reply('Please provide stock id, pepelaugh.');
// 	// 	} else if (args.length > MAX_ARGS) {
// 	// 		message.reply('I can only accept up to **2** stock symbols!');
// 	// 	} else {
// 	// 		args.forEach(symbol => fetchStock(message, symbol));
// 	// 	}
// 	// }
// });