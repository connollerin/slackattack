// Erinsbot code- Erin Connolly for HW2 in CS52 Summer 2016

import botkit from 'botkit';

console.log('starting bot');

// Yelp API code adapted from https://github.com/olalonde/node-yelp
const Yelp = require('yelp');

const yelp = new Yelp({
  consumer_key: 'ia4F-OVDixmShG8b00Qacg',
  consumer_secret: '6tbYBbtqO8bTCjQRCMdCDvBhLnY',
  token: 'KsEmCm-mgP6vuxEkMgvR1oXuFxYU2B7Z',
  token_secret: 'jqukyw_dRc6u6zgrbxnDu6r3qjQ',
});

// Most of the code below taken or adapted from https://github.com/dartmouth-cs52/slackattack examples

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

controller.on('outgoing_webhook', (bot, message) => {
  bot.replyPublic(message, 'yeah yeah i\'ll be up in a minute....\nhttp://media2.giphy.com/media/Eccdry010Mj1m/giphy.gif');
});

controller.hears(['hello', 'hi', 'howdy', 'hey'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});

// for testing, commented out this section--a little TOO annoying--but works :)

// controller.on('user_typing', (bot, message) => {
//   bot.reply(message, 'what are you typing?! :)');
// });

controller.hears(['whats up?', 'sup?'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'nothing much. wbu?');
});

controller.hears(['wbu?'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'I\'m awesome thanks!!');
});

controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Hi! I am a bot. I can have limited conversations with you and also look up nearby restaurants! To do so, mention to me that you\'re hungry :)');
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

// code below adapted from https://github.com/howdyai/botkit and https://github.com/howdyai/botkit/blob/master/examples/convo_bot.js and
// https://github.com/olalonde/node-yelp

// defined several functions for searching restaurants using yelp's api, they call each other in the conversation

const location = function location(answer, convo) {
  convo.ask('Ok, where are you?', (response) => {
    convo.next();
    convo.say('Ok, hold on I am finding results.');
    convo.next();
    yelp.search({ term: `${answer.text}`, location: `${response.text}` })
    .then((data) => {
      if (data.businesses.length < 1) {
        convo.say('Sorry, I can\'t seem to find any of those restaurants in your area.');
        convo.next();
      } else {
        convo.next();
        convo.say(`Here's one that has a rating of ${data.businesses[0].rating}:`);
        convo.next();
        const attachments = {
          attachments: [
            {
              title: `${data.businesses[0].name}`,
              text: `${data.businesses[0].snippet_text}`,
              image_url: `${data.businesses[0].image_url}`,
            },
          ],
        };
        convo.say(attachments);
        convo.next();
      }
    })
    .catch((err) => {
      convo.say('Sorry, I can\'t seem to find any of those restaurants in your area.');
      console.error(err);
      convo.next();
    });
    convo.next();
  });
};
const foodType = function foodType(convo) {
  convo.ask('What type of food are you interested in?', (response) => {
    location(response, convo);
    convo.next();
  });
};

const initialAsk = function initialAsk(convo) {
  convo.ask('Would you like food recommendations near you?', (response) => {
    if (response.text === 'yes') {
      convo.say('Ok great!');
      foodType(convo);
      convo.next();
    } else {
      convo.say('Ok then get some food yourself!');
      convo.next();
    }
  });
};

// this is where the conversation starts--when hungry is mentioned--then in turn each function calls the one above it before searching location

controller.hears(['hungry', 'food'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    initialAsk(convo);
    convo.next();
  });
});

// default message for if someone types something we don't recognize

controller.hears([''], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'hmm, I don\'t understand you. Try asking or telling me in a different way.');
});
