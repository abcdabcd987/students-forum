var db = require('./db');
var Schema = db.Schema;

var schema = new Schema({
    key: String,
    value: Schema.Types.Mixed,
})

module.exports = db.model('config', schema);
