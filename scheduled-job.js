const https = require('https');
const request = require('request');
request('https://umdbmtnsignins.herokuapp.com/updateroster', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.id);
  console.log("performed scheduled task.");
});