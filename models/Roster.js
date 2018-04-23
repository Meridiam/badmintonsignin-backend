var mongoose = require('mongoose');

var rosterSchema = new mongoose.Schema({
    roster: String
});

module.exports = mongoose.model('Roster', rosterSchema);