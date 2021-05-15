require('dotenv').config();

const fetch = require('node-fetch');
const plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);

function fetchStock(message, symbol) {
	const query = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE'
		+ `&symbol=${symbol}`
		+ `&apikey=${process.env.STOCK_API_KEY}`;
	fetch(query)
		.then(response => response.json())
		.then(data => getStockQuote(message, symbol, data));
}

function getStockQuote(message, symbol, data) {
	if (Object.keys(data['Global Quote']).length === 0) {
		message.reply('Invalid Stock Name, pepelaugh.');
		return;
	}

	const quote = data['Global Quote'];
	const price = parseFloat(quote['05. price']);
	const open = parseFloat(quote['02. open']);
	const high = parseFloat(quote['03. high']);
	const low = parseFloat(quote['04. low']);
	const change = parseFloat(quote['09. change']);
	const changePecentage = parseFloat(quote['10. change percent']);

	message.reply(
		`*Pepelaugh*. \n**$${symbol.toUpperCase()}**\n`
		+ `Price: ${price}\n`
		+ `Change: ${change}\n`
		+ `Change Percent: ${changePecentage}\n\n`
		+ `Open: ${open}\n`
		+ `High: ${high}\n`
		+ `Low: ${low}\n`

	);
}

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
		line: {color: '#17BECF'}
	}
	const points = data['Time Series (1min)'];
	for (point in points) {
		stockData.x.push(point);
		stockData.y.push(points[point]['1. open']);
	}
	const layout = {
		fileopt: 'overwrite',
		filename: `${symbol}`,
		yaxis: {
			autorange: true,
			type: 'linear',
		}
	};
	plotly.plot(stockData, layout, (err, response) => {
		if (err) return console.log(err);
		message.reply(`*Pepelaugh*. **$${symbol.toUpperCase()}**: ${response.url}`);
	});
}

module.exports = { fetchStock }

