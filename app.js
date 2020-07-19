const { App } = require('@slack/bolt');
const urlRegex = require('url-regex');

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
});



// https://regex101.com/r/78GYyD/5
const hashTagRegex = new RegExp(/(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,50})(\b|\r)/g);

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages
app.message(async ({ message, say, context }) => {
  // strip out any >'s.
  // console.log(message);
  text = message.text;
  if (text) {
    bookmarkUrl = text.match(urlRegex());
    topic = text.match(hashTagRegex);
    console.log(bookmarkUrl);
    console.log(topic);
    if (topic && bookmarkUrl) { 
      text = text.replace(urlRegex(), '').replace(/</g, '');
      text = text.replace(hashTagRegex, '').trim();
      bookmarkUrl = bookmarkUrl[0].replace(/>/g, '');
      topic = topic[0].replace('#', '');
      // await say(`Received valid Request x<@${message.user}>!`);
      await say(`Received: Topic ${topic} URL ${bookmarkUrl} Label ${text}`);
      await octokit.actions.createWorkflowDispatch({ 
        owner: 'wrecker',
        repo: 'snippets',
        ref: 'master',
        workflow_id: 'manual.yml',
        inputs: { topic: topic, title: text, url: bookmarkUrl}
      });
    }
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 8000);

  console.log('⚡️ Bolt app is running!');
})();
