var http = require('https');
var fs = require('fs');
var currencyRatesApi = 'https://api.exchangerate.host/2021-01-01';
var currencyRatesCacheFile = './dist/currency-rates-cached.json'

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
};

download(currencyRatesApi, currencyRatesCacheFile);
console.log('Cached rates from ' + currencyRatesApi);
