# Cryptocurrency Spreadsheet Utils

Useful cryptocurrency tools (like getting the current price, of Bitcoin, Ethereum) for Google Spreadsheets.

This is the utility script used in the Cryptocurrency Financial Spreadsheet:

https://docs.google.com/spreadsheets/d/1lnE260-F7TSs6onegSVYgRAP0ZZeuUy2YsfO2Ww_eJY/edit?usp=sharing

![Cryptocurrency Financial Spreadsheet](screenshot.png)

The easiest way to use it is to make a copy of the spreadsheet above.

## Using

Add script in Tools > Script editor. Then to use, simply add =getCoinPrice("SYMBOL") in a row. For example, Bitcoin would be
    
    =getCoinPrice("BTC")
    
Ethereum would be

    =getCoinPrice("ETH")
    
Litecoin would be

    =getCoinPrice("LTC")       
 
Almost every crypto currency should work because data is fetched from coinmarketcap.com's API.
which has many and updates pretty regularly. Data is cached for 25 minutes.
    
Questions or comments email contact@bradjasper.com or @bradjasper

Happy trading—be safe out there!

## Refresh

The `refresh()` function updates the cache and update all getCoin* functions with an (unused) timestamp argument to force recalculation.

This function is designed to be attached to a "button" on the spreadsheet.
To insert a "button" use Insert > Drawing to draw your button and place
it on your spreadsheet and then right click the button you just created
and select the drop down menu and choose Assign Script and enter "refresh".
IMPORTANT NOTE: This function is "fragile" (i.e. easily broken) - it does
some simple text manipulation to add the timestamp to the formula.  But it
works for simple cases.

## Other attributes

Calling `getCoinAttr(symbol, attr, asString[optional])` will get any of the attributes returned by the api, as most of these are numbers we return as float, unless asString is set as true.  As of time of writing here are the available attributes with sample values for ETH:

    "id": "ethereum",
    "name": "Ethereum",
    "symbol": "ETH",
    "rank": "2",
    "price_usd": "330.312",
    "price_btc": "0.0706645",
    "24h_volume_usd": "797430000.0",
    "market_cap_usd": "31208113427.0",
    "available_supply": "94480713.0",
    "total_supply": "94480713.0",
    "percent_change_1h": "1.26",
    "percent_change_24h": "1.57",
    "percent_change_7d": "-13.48",
    "last_updated": "1504791305"
    So to display the percent change in the last 1h:
    =getCoinAttr("ETH", "percent_change_1h")/100


## Versions

- v0.2 — 9/7/2017 — Added refresh() and getCoinAttr() functions by John Harding
- v0.1 — 6/29/2017 — Initial release
