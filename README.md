# Currency Exchange Bot for Telegram

A Telegram bot which uses exchange rates from National Bank of Ukraine to convert between different currencies using their rates to Ukrainian hryvna (UAH).

Our bot processes text queries as follows
```
  /convert X.YY [currency_code] to [currency_code]
```
The delimiter for decimals being '.' and currency_code being a currency code from the international [list of currency codes](https://simple.wikipedia.org/wiki/ISO_4217#Active_codes)
The rates are updated daily via get-requests to [NBU server API](https://bank.gov.ua/control/uk/publish/article?art_id=38441973) that provides data in JSON format.

## Built With
- [Telegram Bot API for NodeJS](https://github.com/yagop/node-telegram-bot-api) -- main framework
- [Node schedule](https://github.com/node-schedule/node-schedule) for updating exchange rates daily
- [Request](https://github.com/request/request) for getting data from the NBU server

The bot is deployed on Heroku. 
