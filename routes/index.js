var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Speech = require('../models/speech');
var Vote = require('../models/vote');
var Config = require('../models/config');

router.get('/', function getVotingPage(req, res, next) {
    Speech.getRandom2(function(err, doc1, doc2) {
        if (err) throw err;
        req.session.first = doc1;
        req.session.second = doc2;

        var info = {
            title: "Which is better?",
            first: doc1,
            second: doc2
        };
        res.render('index', info);
    })
});

router.get('/rank', function getRankPage(req, res, next) {
    Speech.find().sort({rating: -1}).exec(function(err, docs) {
        if (err) throw err;
        var list = [];
        for (var i = 0; i < docs.length; ++i) {
            list.push({
                rank: i+1,
                speaker: docs[i].speaker,
                title: docs[i].title,
                rating: docs[i].rating
            });
        }
        var info = {
            title: 'Rank List',
            speeches: list
        }
        res.render("rank", info);
    })
})

router.post('/vote', function postVote(req, res, next) {
    var first = req.session.first;
    var second = req.session.second;
    var choice = req.body.choice;
    if (first && second && (choice in ["0", "1", "2"])) {
        choice = parseInt(choice);
        var d = {
            first: first._id,
            second: second._id,
            result: choice,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };
        Vote.create(d, function(err, doc) {
            if (err) throw err;
            res.redirect("/");
        })
    } else {
        res.send("illegal");
    }
})

/*router.get('/import-list', function getImportList(req, res, next) {
    var list = [
    ];
    var speeches = [];
    for (var i = 0; i < list.length; ++i) {
        speeches.push({
            speaker: list[i][0],
            title: list[i][1],
            rating: 1500,
        })
    }
    Speech.create(speeches, function(err, docs) {
        if (err) throw err;
        var id = ObjectId("000000000000000000000000");
        Config.create({key:"lastid", value:id}, function(err, doc) {
            res.send("done");
            if (err) throw err;
        })
    })
});*/

function updateRating() {
    function newEloRating(old, result) {
        var Ea = 1 / (1 + Math.pow(10, (old.b-old.a)/400));
        var Eb = 1 / (1 + Math.pow(10, (old.a-old.b)/400));
        var K = 16;
        var Sa = null, Sb = null;
        if (result === 1) {
            Sa = 1;
            Sb = 0;
        } else if (result === 2) {
            Sa = 0;
            Sb = 1;
        } else {
            Sa = Sb = 0.5;
        }
        return {
            a: Math.floor(old.a + K * (Sa - Ea)),
            b: Math.floor(old.b + K * (Sb - Eb))
        }
    }

    Config.findOne({key: "lastid"}, function(err, iddoc) {
        if (err) throw err;
        Vote.find({_id: {$gt: iddoc.value}}).sort({_id: 1}).exec(function(err, votes) {
            if (err) throw err;
            if (!votes.length) {
                setTimeout(updateRating, 10000);
                return;
            }
            Speech.find().exec(function(err, speeches) {
                if (err) throw err;
                var rating = {};
                for (var i = 0; i < speeches.length; ++i)
                    rating[speeches[i]._id] = speeches[i].rating;
                for (var i = 0; i < votes.length; ++i) {
                    var first = votes[i].first;
                    var second = votes[i].second;
                    var result = votes[i].result;
                    var old = {
                        a: rating[first],
                        b: rating[second]
                    }
                    var res = newEloRating(old, result);

                    rating[first] = res.a;
                    rating[second] = res.b;
                }

                for (var i = 0; i < speeches.length; ++i) {
                    var id = speeches[i]._id;
                    var info = { $set: { rating: rating[id] } };
                    Speech.findByIdAndUpdate(id, info, function(err) {
                        if (err) throw err;
                    })
                }

                var info = { key: "lastid", value: votes[votes.length-1]._id };
                Config.findByIdAndUpdate(iddoc._id, info, function(err) {
                    if (err) throw err;
                    setTimeout(updateRating, 10000);
                })
            })
        })
    })
}


module.exports = router;
updateRating();