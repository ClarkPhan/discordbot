import 'dotenv/config';
import yahooFinance from 'yahoo-finance2';
import { Message, EmbedBuilder } from 'discord.js';
import { Client } from 'clearbit';

// Logo API
const clearbit = new Client({ key: process.env.CLEARBIT_API_KEY });

// Emojis
const up = ':chart_with_upwards_trend:';
const down = ':chart_with_downwards_trend:';

export const fetchStock = async (message: Message, symbol: string): Promise<void> => {
	try {
		const quote = await yahooFinance.quoteSummary(
			symbol,
			{ modules: ['price', 'summaryDetail', 'assetProfile'] }
		);
		processStockData(message, symbol, quote);
	} catch (error) {
		message.reply(`__**${symbol}**__ is an invalid stock symbol!`);
	  return;
	}
};

const processStockData = (message: Message, symbol: string, quote: any) => {
	const domain = quote.assetProfile.website;
	console.log(domain);
	if (!domain) return generateStockEmbedMessage(message, symbol, quote);
	const Company = clearbit.Company;
	Company.find({ domain })
		.then(res => generateStockEmbedMessage(message, symbol, quote, res.logo))
		.catch(Company.NotFoundError, err => console.log(err))
		.catch((err) => console.log(err));
};

const generateStockEmbedMessage = (message: Message, symbol: string, quote: any, logo?:string) => {
	console.log('generateStockEmbedMessage', logo);
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
	const changes = formatPriceChangeText(change.toFixed(2), (changePercent * 100).toFixed(2));
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
	message.reply({ embeds: [stockEmbed] });
};

const formatPriceChangeText = (change, changePercent) => {
	const priceChange = new Intl.NumberFormat(
		'en-US',
		{ style: 'currency', currency: 'USD' }
	).format(change);
	if (change > 0) {
		return '```diff\n' + `+${priceChange} +${changePercent}%` + '```';
	}
	return '```diff\n' + `${priceChange} ${changePercent}%` + '```';
};