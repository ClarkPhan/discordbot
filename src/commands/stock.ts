import { SlashCommandBuilder } from 'discord.js';
import { fetchStock } from '../api/stock';

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