/**
    Cryptocurrency Spreadsheet Utils

    v0.1
    6/29/2017
    by Brad Jasper

    A simple set of utilites for working with cryptocurrencies in Google Sheets.

    To use, simply add =getCoinPrice("SYMBOL") in a row. For example, Bitcoin would be

        =getCoinPrice("BTC")

    Ethereum would be

        =getCoinPrice("ETH")

    Litecoin would be

        =getCoinPrice("LTC")

    Almost every crypto currency should work because data is fetched from coinmarketcap.com API,
    which has many and updates pretty regularly. Data is cached for 25 minutes.

    Requires Google Sheets permission because we're requesting an external service.
    A version without this permission exists here, but doesn't cache and is much slower:
        https://docs.google.com/spreadsheets/d/170ps_Xpo3fVsVi8niV8rSLJnZ5GFsV7GCEx6IpHNvtA/edit?usp=sharing

    You should use this version if you can as it's much friendlier to coinmarketcap.com's API.

    Questions or comments email contact@bradjasper.com or @bradjasper

    Happy trading—be safe out there!


    ----

    v0.2
    9/7/2017
    by John Harding

    refresh() -

      updates the cache and update all getCoin* functions with an (unused) timestamp
      argument to force recalculation.

      This function is designed to be attached to a "button" on the spreadsheet.

      To insert a "button" use Insert > Drawing to draw your button and place
      it on your spreadsheet and then right click the button you just created
      and select the drop down menu and choose Assign Script and enter "refresh".

      IMPORTANT NOTE: This function is "fragile" (i.e. easily broken) - it does
      some simple text manipulation to add the timestamp to the formula.  But it
      works for simple cases.


    getCoinAttr(symbol, attr, asString[optional]) -

      get any of the attributes returned by the api, as most of these are numbers
      we return as float, unless asString is set as true.  As of time of writing
      here are the available attributes with sample values for ETH:

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

**/

var cache = CacheService.getScriptCache();
var exchangeUrl = "https://api.coinmarketcap.com/v1/ticker/";

function getCoinPrice(symbol) {
  var coin = getCoinInfo(symbol);
  if (!coin) {
    return null;
  }
  return parseFloat(coin.price_usd);
}

function getCoinInfo(symbol) {
  if (!symbol) return;

  Logger.log("Getting coin info for " + symbol);

  var coin = getCachedCoin(symbol);
  if (!coin) {
    Logger.log("No cached cound info found for " + symbol);
    updateExchangeCache();
  }

  coin = getCachedCoin(symbol);
  if (!coin) {
    Logger.log("Unable to find information for " + symbol + " ...something is wrong with the script or service");
    return null;
  }

  return coin;
}

function getCachedCoin(symbol) {
  var cached = cache.get(symbol);
  if (cached) {
    try {
      var coin = JSON.parse(cached);
      return coin;
    } catch (e) {
      Logger.log("Error while parsing coin " + symbol + " from cache");
    }
  }
}

function updateExchangeCache() {
  Logger.log("Updating exchange cached information");

  var response = UrlFetchApp.fetch(exchangeUrl);
  var content = response.getContentText();
  try {
    var data = JSON.parse(content);
  } catch (e) {
    Logger.log("Error while parsing response from exchange: " + content);
  }

  var cachedCoins = {};
  for (var i in data) {
    var coin = data[i];
    cachedCoins[coin.symbol] = JSON.stringify(coin);
  }

  if (cachedCoins) {
    Logger.log("Caching " + Object.keys(cachedCoins).length + " exchange prices");
    cache.putAll(cachedCoins);
  } else {
    Logger.log("No cached coins found");
  }
}

/*
  JDH Additions v0.2 additions
*/


/**
  Fetch the given symbol from the cache and return the value for the given attribute.
  Default is to try to parse as float, pass asString=true to return the string value.
*/
function getCoinAttr(symbol, attr, asString) {
  var coin = getCoinInfo(symbol);
  if (!coin) {
    return null;
  }
  if (asString===true) {
    return coin[attr];
  }
  return parseFloat(coin[attr]);
}

/**
  Update the cache and then loop through all getCoin* functions and add a timestamp
  to the argument list to force the function to be recaclulated.
*/
function refresh() {
  updateExchangeCache();

  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getFormulas();
  for (var i = 0; i < data.length; i++) {
    var row = data[i]
    for (var j=0; j<row.length; j++) {
      var formula = row[j];
      if (formula.indexOf("=getCoin")==0) {
        sheet.getRange(i+1,j+1).setFormula(_addTimestampArg(formula));
      }
    }
  }
}

/*
  Private function - performs simple string manipulation to add a dummy timestamp
  argument to the end of the formula.  This could be improved.  Big time.
*/
function _addTimestampArg(formula) {
  var now = new Date();
  var partAfterFunction="";
  var parts = formula.split(")");
  if (parts.length>1) partAfterFunction = parts[1];
  var parts = parts[0].split(",");
  var lastPart = parts[parts.length-1];
  var newLastPart = '"ts='+now.getTime()+'")' + partAfterFunction;
  if (lastPart.indexOf("ts=")>0)
    parts[parts.length-1]=newLastPart;
  else {
    parts.push(newLastPart);
  }
  return parts.join(",");
}
