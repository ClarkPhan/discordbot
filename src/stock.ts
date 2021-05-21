import 'dotenv/config';
import * as yahooFinance from 'yahoo-finance';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { Client } from 'clearbit';

// Logo API
const clearbit = new Client({ key: process.env.CLEARBIT_API_KEY });

// Emojis
const up = ':chart_with_upwards_trend:';
const down = ':chart_with_downwards_trend:';

export const fetchStock = async (message: Message, symbol: string): Promise<void> => {
	try {
	  const result = await yahooFinance.quote({
			symbol,
			modules: ['price', 'summaryDetail', 'summaryProfile']
		});
		processStockData(message, symbol, result);
	} catch (error) {
		const attachment = new MessageAttachment('./media/monkaX.gif');
		message.reply(`__**${symbol}**__ is an invalid stock symbol!`, attachment);
	  return;
	}
};

const processStockData = (message: Message, symbol: string, data: any) => {
	const domain = data.summaryProfile.website;
	if (!domain) return generateStockEmbedMessage(message, symbol, data);
	const Company = clearbit.Company;
	Company.find({ domain })
		.then(res => generateStockEmbedMessage(message, symbol, data, res.logo))
		.catch(Company.NotFoundError, err => console.log(err))
		.catch(() => console.log('Bad/invalid request, unauthorized, Clearbit error, or failed request'));
};

const generateStockEmbedMessage = (message: Message, symbol: string, data:any, logo?:string) => {
	const quote = data.price;
	const {
		regularMarketPrice: price,
		regularMarketDayHigh: high,
		regularMarketDayLow: low,
		regularMarketOpen: open,
		regularMarketChange: change,
		regularMarketChangePercent: changePercent,
		longName: name,
		regularMarketTime
	} = quote;
	const changes = formatPriceChangeText(change.toFixed(2), (changePercent * 100).toFixed(2));
	const stockEmbed = new MessageEmbed()
		.setColor('GOLD')
		.setTitle(`**$${symbol.toUpperCase()}**`)
		.setAuthor(name)
		// .setDescription(overview['Description'])
		.addFields(
			{ name: 'Price', value: `$${price.toFixed(2)} ${change > 0 ? up : down}` },
			{ name: 'Changes', value: changes },
			{ name: 'Open', value: `$${open.toFixed(2)}`, inline: true },
			{ name: 'High', value: `$${high.toFixed(2)}`, inline: true },
		)
		.addField('Low', `$${low.toFixed(2)}`, true)
		.setThumbnail(logo)
		.setFooter('© Clark Phan', 'https://clarkphan.com/assets/images/me.JPG')
		.setTimestamp(regularMarketTime);
	message.reply(stockEmbed);
};

const formatPriceChangeText = (change, changePercent) => {
	if (change > 0) {
		return '```diff\n' + `+${change} +${changePercent}%` + '```';
	}
	return '```diff\n' + `${change} ${changePercent}%` + '```';
};