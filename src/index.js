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
                switch (entry.cc) {
                    case 'EUR':
                        exchangeRates['EUR'] = entry.rate;
                        break;
                    case 'USD':
                        exchangeRates['USD'] = entry.rate;
                        break;
                    case 'GBP':
                        exchangeRates['GBP'] = entry.rate;
                        break;
                    default:

                }
            });
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
var correctSumRegExp = "\\d+(?:.\\d{1,2})?";
var helpMessage = 'Приветствуем! Пожалуйста, введите число -- сумму, которую хотите конвертировать(разделитель -- точка). Бот предложит вам выбор валюты, из которой конвертировать, и валюты, в которую нужно конвертировать';
var initialCurrencyMessage = 'Пожалуйста, укажите валюту суммы, которую вы хотите конвертировать';
var convertedCurrencyMessage = 'Выберите валюту для конвертирования';
// Listen for any kind of message. There are different kinds of
// // messages.
// bot.on('messag', function (msg){
//     const chatId = msg.chat.id;
//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(msg.chat.id, helpMessage);
// });


// bot.onText(/\/convert/, function (msg, match) {
//     console.log(msg);
//     var fromId = msg.chat.id;
//     var initSum = 0;
//     bot.onText(/^\$?\d+(,\d{3})*(\.\d*)?$/, function (msg, match) {
//         initSum = parseFloat(msg.text);
//         bot.sendMessage(fromId, initialCurrencyMessage, originalCurrencyOptions).then(function () {
//             bot.on('callback_query', function (msg1) {
//                 var init_currency = msg1.data;
//                 var init_rate = exchangeRates[init_currency];
//                 var sumToUAH = initSum * init_rate;
//                 bot.sendMessage(fromId, convertedCurrencyMessage, originalCurrencyOptions).then(function () {
//                     bot.on('callback_query', function (msg2) {
//                         var to_currency = msg2.data;
//                         var to_rate = exchangeRates[to_currency];
//                         var finalSum = sumToUAH / to_rate;
//                         finalSum = finalSum.toFixed(2);
//                         if (finalSum)
//                             return bot.sendMessage(fromId, 'Сумма после конвертации -- ' + finalSum);
//                         initSum = 0;
//                         init_currency = 0;
//                         sumToUAH = 0;
//                         init_rate = 0;
//                         return;
//                     });
//                 });
//             });
//         });
//     });
// });

bot.onText(/\/updateRates/, function (msg, match) {
        updateExchangeRates();
    }
);

bot.onText(/\/convert (.+)/, function (msg, match) {
    var tokens = msg.text.split(" ");
    if(tokens.length != 5){
        return;
    }
    var initSum = tokens[1];
    var initCurrency = tokens[2].toUpperCase();
    var toCurrency = tokens[4].toUpperCase();
    var initCurrencyToUahRate = exchangeRates[initCurrency];
    var uahToToCurrencyRate = exchangeRates[toCurrency];
    var finalSum = initSum * initCurrencyToUahRate / uahToToCurrencyRate;
    bot.sendMessage(msg.chat.id, "Сумма после конвертации -- "+finalSum.toFixed(2));

});





