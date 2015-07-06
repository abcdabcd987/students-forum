var db = require('./db');
var Schema = db.Schema;

var schema = new Schema({
    first:  Schema.Types.ObjectId,
    second: Schema.Types.ObjectId,
    result: Number,
    time:   { type: Date, default: Date.now },
    ip:     String,
})

module.exports = db.model('vote', schema);
