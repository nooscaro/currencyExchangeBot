const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');


const token = '453855287:AAFWGwmSQKOEVcoh2rFuV50_VZR1f-GXPy8';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://currency-exchange-bot.herokuapp.com';


//Creating a bot that uses a webhook to get updates
var port = process.env.PORT || 443;
var host = process.env.HOST;
var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
var externalUrl = 'https://currency-exchange-bot.herokuapp.com/';
bot.setWebHook(externalUrl + ':443/bot' + token);

//NBU api URL to get updated exchange rates
const exchangeRateURL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
//static values for some of the most used currencies in case something goes wrong with the update
var exchangeRates = {
    UAH: 1.0,
    USD: 27.0,
    EUR: 30.0,
    GBP: 36.0
};


const helpMessage = 'Цей бот допоможе Вам швидко переводити суми з однієї валюти до іншої (згідно курсу Національного Банку України, що оновлюється щоденно). \n' +
    'Бот оброблює текстові запити типу "/convert 100 uah to usd" — де  100 — сума цифрами (десятковий роздільник — крапка), uah/usd — міжнародні коди валют латиницею (можуть бути записані у будь-якому регістрі). Деякі широковживані коди валют: \n' +
    '🇺🇦 UAH — гривня\n' +
    '🇷🇺 RUB — російський рубль\n' +
    '🇺🇸 USD — долар США\n' +
    '🇪🇺 EUR — євро\n' +
    '🇬🇧 GBP — фунт стерлінгів\n' +
    '🇵🇱 PLN — злотий\n' +
    '🇯🇵 JPY — єна\n' +
    '🇨🇳 CNY — юань\n' +
    'Оновлення курсу відбувається щоденно, але якщо Ви хочете упевнитися, що він актуальний, Ви можете зробити це самостійно за допомогою команди /update\n' +
    'Подивитися актуальний курс валют для найбільш популярних валют можна за допомогою команди /rates\n' +
    'Для виклику інструкції — команда /help';


function updateExchangeRates() {

    var request = require('request');

    request.get(exchangeRateURL, {}, function (err, res, data) {
        if (err) {
            return console.log(err);
        }

        if (res.statusCode != 209) {
            var JSONDATA = data;
            exchangeRates = [];
            exchangeRates['UAH'] = 1;
            var jsonList = JSON.parse(JSONDATA);
            jsonList.forEach(function (entry) {
                exchangeRates[entry.cc] = entry.rate;
            });
        }
        console.log("Exchange rates updated!!!!!!");
    });


}


//updates exchange rates every 15 minutes
schedule.scheduleJob('*/15 * * * *', function () {
    updateExchangeRates();
});


bot.onText(/\/update/, function (msg, match) {
    updateExchangeRates();
});


bot.onText(/\/convert (.+)/, function (msg, match) {

    var tokens = msg.text.split(" ");
    //request validation
    if (tokens.length != 5) {
        bot.sendMessage(msg.chat.id, "Неправильний формат запису. Скористайтесь /help.");
        return;
    }
    var re = /^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/;
    if (!re.test(tokens[1])) {
        bot.sendMessage(msg.chat.id, "Неправильний формат запису. Скористайтесь /help.");
        return;
    }
    if (!exchangeRates.hasOwnProperty(tokens[2].toUpperCase()) || !exchangeRates.hasOwnProperty(tokens[4].toUpperCase())) {
        updateExchangeRates();
        if (!exchangeRates.hasOwnProperty(tokens[2].toUpperCase()) || !exchangeRates.hasOwnProperty(tokens[4].toUpperCase())) {
            bot.sendMessage(msg.chat.id, "Неправильний формат запису. Скористайтесь /help.");
            return;

        }
    }

    var initSum = tokens[1];
    if (isNaN(initSum)) {
        bot.sendMessage(msg.chat.id, "Неправильний формат запису. Скористайтесь /help.");
        return;
    }
    // request processing (converting from initial currency to UAH and then to the desired currency
    var initCurrency = tokens[2].toUpperCase();
    var toCurrency = tokens[4].toUpperCase();
    var initCurrencyToUahRate = exchangeRates[initCurrency];
    var uahToToCurrencyRate = exchangeRates[toCurrency];
    var finalSum = initSum * initCurrencyToUahRate / uahToToCurrencyRate;
    bot.sendMessage(msg.chat.id, "Сума після конвертації: " + finalSum.toFixed(2) + toCurrency);


});


bot.onText(/\/start/, function (msg, match) {
    updateExchangeRates();
    bot.sendMessage(msg.chat.id, helpMessage);
});


bot.onText(/\/rates/, function (msg, match) {
    var exchangeRatesForToday = "Курс валют (до гривні) на сьогодні\n" + "🇺🇸 1.00 USD -- " + exchangeRates['USD'].toFixed(3) + " гривень\n" + "🇪🇺 1.00 EUR -- " + exchangeRates['EUR'].toFixed(3) + " гривень\n" + "🇬🇧 1.00 GBP -- " + exchangeRates['GBP'].toFixed(3) + " гривень\n" + "🇷🇺 1.00 RUB -- " + exchangeRates['RUB'].toFixed(3) + " гривень\n";
    bot.sendMessage(msg.chat.id, exchangeRatesForToday);
});

bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpMessage);
});
