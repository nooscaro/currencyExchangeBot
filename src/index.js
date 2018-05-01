const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
// replace the value below with the Telegram token you receive from @BotFather
const token = '453855287:AAFWGwmSQKOEVcoh2rFuV50_VZR1f-GXPy8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const exchangeRateURL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
var exchangeRates = {
    UAH: 1.0,
    USD: 27.0,
    EUR: 30.0,
    GBP: 36.0
};
//updates exchange rates every day at 9 am
schedule.scheduleJob('0 9 * * * ', function () {
    updateExchangeRates();
});


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
                exchangeRates[entry.cc]=entry.rate;
            });
            console.log(exchangeRates);
        }
    });

}

var originalCurrencyOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'UAH', callback_data: 'UAH'}],
            [{text: 'USD', callback_data: 'USD'}],
            [{text: 'GBP', callback_data: 'GBP'}]
        ]
    })
};

bot.onText(/\/update/, function (msg, match) {
    updateExchangeRates();
});

bot.onText(/\/convert (.+)/, function (msg, match) {
    var tokens = msg.text.split(" ");
    if(tokens.length != 5){
        return;
    }

    var re = /^\d+([.,]\d{1,2})?$/;
    if(isNaN(tokens[1]) || re.test(tokens[1])){
        bot.sendMessage(msg.chat.id, "Incorrect input. Read the \help.");
        return;
    }
    
    if(tokens[2]!= originalCurrencyOptions.inline_keyboard[0] || tokens[2]!= originalCurrencyOptions.inline_keyboard[1] || tokens[2]!= originalCurrencyOptions.inline_keyboard[2] ){
        bot.sendMessage(msg.chat.id, "Incorrect input. Read the \help.");
     return;
    }

    if(tokens[4]!= originalCurrencyOptions.inline_keyboard[0] || tokens[4]!= originalCurrencyOptions.inline_keyboard[1] || tokens[4]!= originalCurrencyOptions.inline_keyboard[2] ){
        bot.sendMessage(msg.chat.id, "Incorrect input. Read the \help.");
        return;
    }
    var initSum = tokens[1];
    var initCurrency = tokens[2].toUpperCase();
    var toCurrency = tokens[4].toUpperCase();
    var initCurrencyToUahRate = exchangeRates[initCurrency];
    var uahToToCurrencyRate = exchangeRates[toCurrency];
    var finalSum = initSum * initCurrencyToUahRate / uahToToCurrencyRate;
    bot.sendMessage(msg.chat.id, "Сума післа конвертації -- "+finalSum.toFixed(2));

});