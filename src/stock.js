require('dotenv').config();

const { MessageAttachment, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const clearbit = require('clearbit')(process.env.CLEARBIT_API_KEY);
const plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);
const up = ':chart_with_upwards_trend:';
const down = ':chart_with_downwards_trend:';

function fetchStock(message, symbol) {
	const query = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE'
		+ `&symbol=${symbol}`
		+ `&apikey=${process.env.STOCK_API_KEY}`;
	fetch(query)
		.then(response => response.json())
		.then(data => processStockData(message, symbol, data));
}
function getStockLogo(message, symbol, data, overview) {
	if (overview === undefined || overview === null || Object.keys(overview).length === 0) {
		return generateStockEmbedMessage(message, symbol, data);
	}
	console.log(overview['Name']);
	let name = overview['Name'].split(',');
	name = name[0].replace('Corporation', '').replace('Corp', '').replace('Inc', '').replace('Global', '').replace('.com', '');
	console.log(name);
	const NameToDomain = clearbit.NameToDomain;
	NameToDomain.find({ name })
		.then(logoResult => generateStockEmbedMessage(message, symbol, data, overview, logoResult))
		.catch(NameToDomain.NotFoundError, err => console.log(err))
		.catch(() => console.log('Bad/invalid request, unauthorized, Clearbit error, or failed request'));
}

function generateStockEmbedMessage(message, symbol, data, overview, logoResult) {
	const quote = data['Global Quote'];
	const price = parseFloat(quote['05. price']);
	const open = parseFloat(quote['02. open']);
	const high = parseFloat(quote['03. high']);
	const low = parseFloat(quote['04. low']);
	const change = parseFloat(quote['09. change']);
	const changePercent = parseFloat(quote['10. change percent']);
	const changes = formatPriceChangeText(change, changePercent);
	let name;
	let thumbnail;
	if (overview === undefined) {
		name = symbol;
	} else {
		name = overview['Name'];
	}
	if (logoResult === undefined) {
		thumbnail = null;
	} else {
		thumbnail = logoResult.logo;
	}
	const stockEmbed = new MessageEmbed()
		.setColor('GOLD')
		.setTitle(`**$${symbol.toUpperCase()}**`)
		.setAuthor(name)
		// .setDescription(overview['Description'])
		.addFields(
			{ name: 'Price', value: `$${price} ${change > 0 ? up : down}` },
			{ name: 'Changes', value: changes },
			{ name: 'Open', value: `$${open}`, inline: true },
			{ name: 'High', value: `$${high}`, inline: true },
		)
		.addField('Low', `$${low}`, true)
		.setTimestamp()
		.setFooter(`© Clark Phan ${thumbnail !== null ? '(logos provided by Clearbit API)' : ''} `, 'https://clarkphan.com/assets/images/me.JPG');
	if (thumbnail) {
		stockEmbed.setThumbnail(thumbnail);
	}
	message.reply(stockEmbed);
}
function processStockData(message, symbol, data) {
	if (Object.keys(data['Global Quote']).length === 0) {
		const attachment = new MessageAttachment('./media/monkaX.gif');
		message.reply(`__**${symbol}**__ is an invalid stock symbol!`, attachment);
		return;
	}
	const query = 'https://www.alphavantage.co/query?function=OVERVIEW'
		+ `&symbol=${symbol}`
		+ `&apikey=${process.env.STOCK_API_KEY}`;
	fetch(query)
		.then(response => response.json())
		.then(overview => getStockLogo(message, symbol, data, overview));
}

function formatPriceChangeText(change, changePercent) {
	if (change > 0) {
		return '```diff\n' + `+${change} +${changePercent}%` + '```';
	}
	return '```diff\n' + `${change} ${changePercent}%` + '```';
}


// eslint-disable-next-line no-unused-vars
function generateStockGraph(message, symbol, data) {
	if (data['Error Message']) {
		message.reply('Invalid Stock Name, pepelaugh.');
		return;
	}
	console.log(`[${message.author.username} ${message.createdAt}]: ${message}`);
	const stockData = {
		x: [],
		y: [],
		type: 'scatter',
		mode: 'lines',
		line: { color: '#17BECF' }
	};
	const points = data['Time Series (1min)'];
	for (const point in points) {
		stockData.x.push(point);
		stockData.y.push(points[point]['1. open']);
	}
	const layout = {
		fileopt: 'overwrite',
		filename: `${symbol}`,
		yaxis: {
			autorange: true,
			type: 'linear'
		},
	};
	plotly.plot(stockData, layout, (err, response) => {
		if (err) return console.log(err);
		message.reply(`*Pepelaugh*. **$${symbol.toUpperCase()}**: ${response.url}`);
	});
}

module.exports = { fetchStock };