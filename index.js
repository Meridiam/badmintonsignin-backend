const express = require('express');
const request = require('request');
const redis = require('redis');
const bodyParser = require('body-parser');

var db = process.env.REDIS_URL || "//127.0.0.1:6379";
const client = redis.createClient(db);

const url = "https://umsporttool.umd.edu/api/Rosters/get?clubID=Bdmtn";

var app = express();

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use(bodyParser.json());

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
        client.get((currDate.getMonth()+1)+"/"+currDate.getDate()+"/"+currDate.getFullYear(), function(err2, reply2) {
            res.send(JSON.stringify({roster: reply,
                                    registered: reply2}));
        });
    });
});

app.post('/signin', function (req, res) {
    var currDate = new Date();
    var datestring = (currDate.getMonth()+1)+"/"+currDate.getDate()+"/"+currDate.getFullYear();
    client.set(datestring, req.body.name);
});

var port = process.env.PORT || 3000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");