const moment = require('moment');
const util = require('../../core/util.js');
const _ = require('lodash');
const log = require('../../core/log');

var config = util.getConfig();
var dirs = util.dirs();

var Fetcher = require(dirs.exchanges + 'binance');

util.makeEventEmitter(Fetcher);

var end = false;
var done = false;
var from = false;

var fetcher = new Fetcher(config.watch);

var fetch = () => {
  fetcher.import = true;
  fetcher.getTrades(from, handleFetch);
};

var handleFetch = (err, trades) => {
  if (err) {
    // console.log("err done");
    log.error(`There was an error importing from Binance ${err}`);
    fetcher.emit('done');
    return fetcher.emit('trades', []);
  }

  if (trades.length > 0) {
    var last = moment.unix(_.last(trades).date).utc();
    var next = last;
    if (last <= from) next = last.clone().add(1, 'h').subtract(1, 's');
  } else {
    // Conversion to milliseconds epoch time means we have to compensate for possible leap seconds
    var next = from.clone().add(1, 'h').subtract(1, 's');
    log.debug('Import step returned no results, moving to the next 1h period');
  }

  if (next >= end || from.add(1, 'h') >= end) {
    fetcher.emit('done');

    var endUnix = end.unix();
    trades = _.filter(trades, t => t.date <= endUnix);
  }
  // console.log(`result: ${from.format('YYYY-MM-DD HH:mm:ss')} last len: ${trades.length}`)
  from = next.clone();
  log.info('Result trades count: ', trades.length);
  fetcher.emit('trades', trades);
};

module.exports = function (daterange) {
  from = daterange.from.clone().utc();
  end = daterange.to.clone().utc();

  return {
    bus: fetcher,
    fetch: fetch,
  };
};
