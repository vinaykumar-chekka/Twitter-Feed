var express = require('express');
var router = express.Router();

// var Twitter = require('twitter');
var Twitter_Node_Api = require('node-twitter-api');
var Twitter_Api = require('../src/twitter');

var twitter = new Twitter_Node_Api({
    consumerKey: 'RUReVXHrJR9QXG4C2HMwHnXew',
    consumerSecret: 'OwYYxay50yn81YctyX5HuB0DvdkX3NaK4taxbGv5WAXsCx7arS',
    callback: 'http://localhost:3000/callback'
});

var _requestSecret;

router.get('/', function(req, res) {
	res.render('../views/' + 'index');
});

router.get('/twitter', function(req, res) {
    twitter.getRequestToken(function(err, requestToken, requestSecret) {
        if (err)
            res.status(500).send(err);
        else {
            _requestSecret = requestSecret;
            res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
        }
    });
});

router.get('/callback', function(req, res) { // User context level Authorization
    var requestToken = req.query.oauth_token,
        verifier = req.query.oauth_verifier;

    twitter.getAccessToken(requestToken, _requestSecret, verifier, function(err, accessToken, accessSecret) {
        if (err)
            res.status(500).send(err);
        else
            twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
                if (err) {
                  res.status(500).send(err);
                } else {
                    Twitter_Api.getUserHomeFeed(accessToken, accessSecret, function(err, outResp) {
                        res.render('../views/' + 'twitter', {
                            title: "Social crawling - Twitter",
                            source: 'twitter_home_timeline',
                            data: outResp
                        });
                    });
                }
            });
    });
});

module.exports = router;
