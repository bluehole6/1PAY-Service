const request = require('request');
var parseString = require('xml2js').parseString;

request('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/sales/json?page=1', function (error, response, body) {
  //console.error('error:', error); // Print the error if one occurred
  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.

  parseString(body, function (err, result) {
    console.dir(result.rss.channel[0].item[0].description[0].header[0].wf);
    });
});