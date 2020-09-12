const Discord = require('discord.js')

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let discordID = message.author.id;

  let doc = await db
    .collection("users")
    .where("discordId", "==", discordID)
    .get();
  doc = doc.docs;
  if (doc.length === 0) {
    return {
      status: false,
      message: `Could not find user`,
    };
  }

  doc = doc[0].data();

  let pbObj = doc.personalBests;

  const maxesTime = Object.fromEntries(
    Object.entries(pbObj.time).map(([key, array]) => [
      key,
      Math.max(...array.map(({ wpm }) => wpm)),
    ])
  );

  const maxesWords = Object.fromEntries(
    Object.entries(pbObj.words).map(([key, array]) => [
      key,
      Math.max(...array.map(({ wpm }) => wpm)),
    ])
  );

  //embeds for time and word high scores, complete with undefined validation

  const timeHighScoreEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setTitle("Time Personal Bests for " + message.author.username);
  if (maxesTime[15]) {
    timeHighScoreEmbed.addField("15s Highscore:", `${maxesTime[15]} wpm`);
  }
  if (maxesTime[30]) {
    timeHighScoreEmbed.addField("30s Highscore:", `${maxesTime[30]} wpm`);
  }
  if (maxesTime[60]) {
    timeHighScoreEmbed.addField("60s Highscore:", `${maxesTime[60]} wpm`);
  }
  if (maxesTime[120]) {
    timeHighScoreEmbed.addField("120s Highscore:", `${maxesTime[120]} wpm`);
  }
  message.channel.send(timeHighScoreEmbed);

  const wordHighScoreEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setTitle("Word Personal Bests for " + message.author.username);
  if (maxesWords[10]) {
    wordHighScoreEmbed.addField("10 Word Highscore:", `${maxesWords[10]} wpm`);
  }
  if (maxesWords[25]) {
    wordHighScoreEmbed.addField("25 Word Highscore:", `${maxesWords[25]} wpm`);
  }
  if (maxesWords[50]) {
    wordHighScoreEmbed.addField("50 Word Highscore:", `${maxesWords[50]} wpm`);
  }
  if (maxesWords[100]) {
    wordHighScoreEmbed.addField("100 Word Highscore:", `${maxesWords[100]} wpm`);
  }
  message.channel.send(wordHighScoreEmbed);
  return {
    status: true,
    message: ``,
  };
};

module.exports.cmd = {
  name: "pb",
  needMod: false,
  onlyBotCommandsChannel: true
};
