// example bot
import botkit from 'botkit';

console.log('starting bot');

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

controller.hears(['hello', 'hi', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});

controller.on('user_typing', (bot, message) => {
  bot.reply(message, 'what are you typing?! :)');
});

controller.hears(['what\'s up?', 'sup?'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'nothing much. wbu?');
});

controller.hears(['bye', 'see ya', 'adios'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Bye, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Bye!');
    }
  });
});

var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'ia4F-OVDixmShG8b00Qacg',
  consumer_secret: '6tbYBbtqO8bTCjQRCMdCDvBhLnY',
  token: 'KsEmCm-mgP6vuxEkMgvR1oXuFxYU2B7Z',
  token_secret: 'jqukyw_dRc6u6zgrbxnDu6r3qjQ',
});


yelp.businesses.forEach(business => {
  // do something with business

});
