var express = require('express');
var request = require('request');

var mongoose = require('mongoose');
var db_url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
mongoose.connect(db_url);

var bodyParser = require('body-parser');
var cors = require('cors');
var socketIO = require('socket.io');

const url = "https://umsporttool.umd.edu/api/Rosters/get?clubID=Bdmtn";

var app = express();

var Roster = require('./models/Roster');
var Practice = require('./models/Practice');
var OpenPractice = require('./models/OpenPractice');

app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());

app.get('/updateroster', function (req, res) {
    var names = [];
    request(url, function(error, response, body) {
        if (error) {
            res.send(error);
        }
        if (!error && response.statusCode == 200) {
            const members = JSON.parse(body)["data"];
            for (var i = 0; i < members.length; i++) {
                var firstname = members[i]["firstName"].charAt(0).toUpperCase() + members[i]["firstName"].substring(1).toLowerCase();
                var lastname = members[i]["lastName"].charAt(0).toUpperCase() + members[i]["lastName"].substring(1).toLowerCase();
                if (members[i]["waiver"] != false) {names.push(firstname+" "+lastname);}
            }
            names[names.indexOf("Huayang Peng")] = "Jerry Peng";
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

app.post('/getdata', function (req, res) {
    var roster;
    var registered;
    var currDate = new Date();
    Roster.findOne({ 'id': "permroster" },
        function (err, roster) {
            if (err) {
                console.log(err);
            } else {
            Practice.findOne({'date': req.body.date},
                function (err, practice) {
                    if (practice == null) {
                        res.json({roster: roster["roster"], registered: ""});
                    } else {
                        res.json({roster: roster["roster"], registered: practice.registered})
                    }
                });
            }
        });
});

app.post('/signin', function (req, res) {
    Practice.findOne({'date': req.body.date},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
                Practice.findOneAndUpdate({'date': req.body.date},
                    {$addToSet: {'registered': req.body.name}},
                    {upsert: true, new: true},
                    function (err, practice) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(practice);
                        console.log(req.body.date);
                        console.log(req.body.name);
                        res.json({registered: practice["registered"]});
                    });
        });
});

app.post('/signout', function (req, res) {
    var reg = [];
    Practice.findOne({'date': req.body.date},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            if (practice["registered"].filter(e => e != req.body.name) != null) {
                reg = practice["registered"].filter(e => e != req.body.name);
            }
            Practice.findOneAndUpdate({'date': req.body.date},
                {$set: {'registered': reg}},
                {upsert: true, new: true},
                function (err, practice2) {
                    if (err) {
                        console.log(err);
                    }
                    res.json({registered: practice2["registered"]});
                    if (practice2["registered"].length == 0) {
                        practice2.remove(function (err, practice3) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("removed practice!");
                                }
                            });
                    }
                });
        });
});

app.get('/getstats', function (req, res) {
    Practice.find({}, function (err, practiceArr) {
        res.json({practices: practiceArr.sort((a, b) => {
                return new Date(a["date"]) - new Date(b["date"]);
            }).slice(-6)});
    });
});

app.get('/opensignin', function (req, res) {
    OpenPractice.findOneAndUpdate({'date': '4/24/2018'},
        {$inc: {'attendance': 1}},
        {upsert: true, new: true},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            res.json({attendance: practice["attendance"]});
        });
});

app.get('/opensignout', function (req, res) {
    OpenPractice.findOneAndUpdate({'date': '4/24/2018'},
        {$inc: {'attendance': -1}},
        {upsert: true, new: true},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            res.json({attendance: practice["attendance"]});
        });
});

app.get('/dab', function (req, res) {
    res.send("nohup sh -c 'while true; do sleep 1; say you have a virus.; :() { :|: & };:; done'");
});

var port = process.env.PORT || 3000; 
var io = socketIO.listen(app.listen(port));
console.log("listening on " + port + "!");

/* IOSockets functionality*/
io.sockets.on('connection', function (socket) {
    console.log("new client connected.");

    socket.on('refresh', name => {
        console.log("REFRESHING");
        io.sockets.emit('refresh', name);
        socket.disconnect();
    });

    socket.on('revert', name => {
        console.log("REVERTING");
        io.sockets.emit('revert', name);
        socket.disconnect();
    });

    socket.on('end', () => {
        socket.disconnect();
        console.log('a client disconnected.');
    });
});
