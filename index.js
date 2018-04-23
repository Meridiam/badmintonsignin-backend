const express = require('express');
const request = require('request');
const redis = require('redis');

var db = process.env.REDIS_URL || "//127.0.0.1:6379";
const client = redis.createClient(db);

const url = "https://umsporttool.umd.edu/api/Rosters/get?clubID=Bdmtn";

var app = express();
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

app.get('/updateroster', function (req, res) {
    var names = [];
    request(url, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const members = JSON.parse(body)["data"];
            for (var i = 0; i < members.length; i++) {
                var firstname = members[i]["firstName"].charAt(0).toUpperCase() + members[i]["firstName"].substring(1).toLowerCase();
                var lastname = members[i]["lastName"].charAt(0).toUpperCase() + members[i]["lastName"].substring(1).toLowerCase();
                names.push(firstname+" "+lastname);
            }
            client.set("roster", names.join(","), redis.print);
        }
    });
});

app.get('/getroster', function (req, res) {
    client.get("roster", function(err, reply) {
        res.send(reply);
    });
});

var port = process.env.PORT || 3000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");