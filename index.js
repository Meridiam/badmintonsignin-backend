const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const bodyParser = require('body-parser');
const cors = require('cors');

const url = "https://umsporttool.umd.edu/api/Rosters/get?clubID=Bdmtn";

var app = express();
var Roster = require('./models/Roster');
var Practice = require('./models/Practice');

app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());

app.get('/updateroster', function (req, res) {
    var names = [];
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            const members = JSON.parse(body)["data"];
            for (var i = 0; i < members.length; i++) {
                var firstname = members[i]["firstName"].charAt(0).toUpperCase() + members[i]["firstName"].substring(1).toLowerCase();
                var lastname = members[i]["lastName"].charAt(0).toUpperCase() + members[i]["lastName"].substring(1).toLowerCase();
                names.push(firstname+" "+lastname);
            }
            Roster.findOneAndUpdate({ "id": "permroster" },
            {$set: {'roster': names}},
            {upsert: true, new: true},
            function (err, roster) {
                if (err) {
                    console.log(err);
                }
                res.json(roster);
            });
        }
    });
});

app.get('/getdata', function (req, res) {
    var roster;
    var registered;
    var currDate = new Date();
    Roster.findOne({ 'id': "permroster" },
        function (err, roster) {
            if (err) {
                console.log(err);
            } else {
            Practice.findOne({ 'date': (currDate.getMonth()+1)+"/"+currDate.getDate()+"/"+currDate.getFullYear()},
                function (err, practice) {
                    if (practice == null) {
                        res.json({roster: roster.roster, registered: ""});
                    } else {
                        res.json({roster: roster.roster, registered: practice.registered})
                    }
                });
            }
        });
});

app.get('/signin', function (req, res) {
    var currDate = new Date();
    var datestring = (currDate.getMonth()+1)+"/"+currDate.getDate()+"/"+currDate.getFullYear();
    var registered;
    Practice.findOneAndUpdate({ 'date': (currDate.getMonth()+1)+"/"+currDate.getDate()+"/"+currDate.getFullYear()},
        {$push: {'registered': "Akshit Garg"}},
        {upsert: true, new: true},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            res.json({registered: practice["registered"]});
        });
});

var port = process.env.PORT || 3000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");