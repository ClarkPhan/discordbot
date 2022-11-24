import * as dotenv from 'dotenv';
import { CommandInteraction, EmbedBuilder } from 'discord.js';

// Logo API
import { Client } from 'clearbit';

// Yahoo Finance API
import yahooFinance from 'yahoo-finance2';
import { QuoteSummaryResult } from 'yahoo-finance2/dist/esm/src/modules/quoteSummary-iface';

// Load environment variables
dotenv.config();

// Logo API
const clearbit = new Client({ key: process.env.CLEARBIT_API_KEY });

// Emojis for Embed Messages
const up = ':chart_with_upwards_trend:';
const down = ':chart_with_downwards_trend:';

// Fetch the stock data based on user slash command
export const fetchStock = async (interaction: CommandInteraction, symbol: string): Promise<void> => {
	const processStockData = (quote: QuoteSummaryResult) => {
		const domain = quote.assetProfile.website;
		if (!domain) return generateStockEmbedMessage(quote);
		const Company = clearbit.Company;
		Company.find({ domain })
			.then(res => generateStockEmbedMessage(quote, res.logo))
			.catch(Company.NotFoundError, err => console.log(err))
			.catch((err) => console.log(err));
	};
	const generateStockEmbedMessage = (quote: QuoteSummaryResult, logo?:string) => {
		const { price } = quote;
		const {
			regularMarketPrice,
			regularMarketDayHigh: high,
			regularMarketDayLow: low,
			regularMarketOpen: open,
			regularMarketChange: change,
			regularMarketChangePercent: changePercent,
			longName,
			regularMarketTime,
		} = price;
		const priceChange = new Intl.NumberFormat(
			'en-US',
			{ style: 'currency', currency: 'USD' }
		).format(change);
		const priceChangePercent = (changePercent * 100).toFixed(2);
		let changes: string;
		if (change > 0) {
			changes = '```diff\n' + `+${priceChange} +${priceChangePercent}%` + '```';
		} else {
			changes = '```diff\n' + `${priceChange} ${priceChangePercent}%` + '```';
		}
		const stockEmbed = new EmbedBuilder()
			.setColor(`${change > 0 ? 'Green' : 'Red'}`)
			.setTitle(`**$${symbol.toUpperCase()}**`)
			.setAuthor({ name: longName, iconURL: logo })
			// .setDescription(overview['Description'])
			.addFields(
				{ name: 'Price', value: `$${regularMarketPrice.toFixed(2)} ${change > 0 ? up : down}` },
				{ name: 'Changes', value: changes },
				{ name: 'Open', value: `$${open.toFixed(2)}`, inline: true },
				{ name: 'High', value: `$${high.toFixed(2)}`, inline: true },
				{ name: 'Low', value: `$${low.toFixed(2)}`, inline: true }
			)
			.setThumbnail(logo)
			.setFooter({ text: '© Clark Phan' })
			.setTimestamp(regularMarketTime);
		interaction.reply({ embeds: [stockEmbed] });
	};
	try {
		const quote = await yahooFinance.quoteSummary(
			symbol,
			{ modules: ['price', 'summaryDetail', 'assetProfile'] }
		);
		processStockData(quote);
	} catch (error) {
		interaction.reply({ content: 'Invalid stock symbol!', ephemeral: true });
	  return;
	}
};