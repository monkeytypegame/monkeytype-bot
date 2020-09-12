const Discord = require('discord.js')

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);
    let discordID = message.author.id

    let doc = await db.collection("users").where("discordId","==",discordID).get().data();
    let pbObj = doc.personalBests;

    const maxesTime = Object
  .fromEntries(Object
    .entries(pbObj.time)
    .map(([key, array]) => ([key, Math.max(...array.map(({ wpm }) => wpm))])));

    const maxesWords = Object
  .fromEntries(Object
    .entries(pbObj.words)
    .map(([key, array]) => ([key, Math.max(...array.map(({ wpm }) => wpm))])));

  for (let i in maxesWords) {
    if (maxesWords[i]) {
      message.channel.send(`Your ${i} word highscore: ${maxesWords[i]}wpm`);
    }
  }

  //embeds for time and word high scores, complete with undefined validation

  const timeHighScoreEmbed = new Discord.MessageEmbed()
  .setcolour('#0099FF')
  .setTitle('Timed High Scores')
  if (maxesTime[15]) {
    highScoreEmbed.addField('15s Highscore:', `${maxesTime[15]}`);
  } 
  if (maxesTime[30]) {
    highScoreEmbed.addField('30s Highscore:', `${maxesTime[30]}`);
  } 
  if (maxesTime[60]) {
    highScoreEmbed.addField('60s Highscore:', `${maxesTime[60]}`);
  } 
  if (maxesTime[120]) {
    highScoreEmbed.addField('120s Highscore:', `${maxesTime[120]}`);
  } 
  message.channel.send(timeHighScoreEmbed);

  const wordHighScoreEmbed = new Discord.MessageEmbed()
  .setcolour('#0099FF')
  .setTitle('Word High Scores')
  if (maxesWords[10]) {
    highScoreEmbed.addField('10 Word Highscore:', `${maxesWords[10]}`);
  } 
  if (maxesWords[25]) {
    highScoreEmbed.addField('25 Word Highscore:', `${maxesWords[25]}`);
  } 
  if (maxesWords[50]) {
    highScoreEmbed.addField('50 Word Highscore:', `${maxesWords[50]}`);
  } 
  if (maxesWords[100]) {
    highScoreEmbed.addField('100 Word Highscore:', `${maxesWords[100]}`);
  } 
  message.channel.send(wordHighScoreEmbed);
  
};
  
  module.exports.cmd = {
    name: "pb",
    needMod: false,
  };