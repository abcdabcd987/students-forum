var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var dbi = {
    db: 'studentsforum'
};

exports.DB_URL = 'mongodb://localhost/' + dbi.db;
exports.sessionDB = {
    secret: '$#Vf219bF3$)#*@j12801%32',
    store: new mongoStore(dbi)
};