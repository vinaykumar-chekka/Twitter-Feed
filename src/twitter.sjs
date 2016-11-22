var Twitter = require('twitter');
var dir = '../views/';

exports.getUserHomeFeed = getUserHomeFeed;

task getUserHomeFeed(access_token_key, access_token_secret) {
  client = new Twitter({
    consumer_key: "RUReVXHrJR9QXG4C2HMwHnXew",
    consumer_secret: "OwYYxay50yn81YctyX5HuB0DvdkX3NaK4taxbGv5WAXsCx7arS",
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
  });
  home_timeline <- client.get('statuses/home_timeline');
  return home_timeline;
}