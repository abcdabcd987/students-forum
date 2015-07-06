var settings = require('../settings');
var db = require('mongoose');

db.connect(settings.DB_URL);
db.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;
