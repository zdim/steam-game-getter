/*jshint esversion: 6 */
require("dotenv").config();
const discord = require("discord.js");
const commands = require("./commands");
const { getRandomNumber } = require("./utils");

const bot = new discord.Client();

bot.on("message", message => {
  if (message.author == bot.user || !message.content.startsWith("!")) return;

  const splitCommand = message.content.split(" ").filter(Boolean);
  const args = splitCommand.slice(1);
  const sendMessage = msg => message.channel.send(msg);

  switch (splitCommand[0]) {
    case "!wswp":
    commands.whatShouldWePlay(args)
        .then(game => sendMessage(youShouldPlay(game)))
        .catch(err => err ? sendMessage(err) : sendMessage("Oops! Something went wrong, try again!"));
      break;
    case "!wsip":
    commands.whatShouldIPlay(args)
      .then(game => sendMessage(youShouldPlay(game)))
      .catch(err => err ? sendMessage(err) : sendMessage("Oops! Something went wrong, try again!"));
      break;
  }
});

function youShouldPlay(game) {
    const possibleResponses = [
        `You should play **${game}**`,
        `How about **${game}**?`,
        `Give **${game}** a shot`,
        `Time for some **${game}**`,
        `Why not **${game}**?`
    ];

    return possibleResponses[getRandomNumber(0, possibleResponses.length)];
}

bot.login(process.env.BOT_KEY);