var db = require('./db');
var Schema = db.Schema;

var schema = new Schema({
    speaker: String,
    title:   String,
    rating:  Number,
})

var Speech = db.model('speech', schema);

Speech.getRandom2 = function(cb) {
    Speech.count(function(err, count) {
        if (err) return cb(err);
        var rand1 = Math.floor(Math.random() * count);
        var rand2 = null
        do {
            rand2 = Math.floor(Math.random() * count);
        } while (rand1 == rand2);

        Speech.findOne().skip(rand1).exec(function(err, doc1) {
            if (err) return cb(err);
            Speech.findOne().skip(rand2).exec(function(err, doc2) {
                if (err) return cb(err);
                return cb(null, doc1, doc2);
            });
        });
    });
};

module.exports = Speech;