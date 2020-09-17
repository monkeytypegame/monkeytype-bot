const Discord = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let discordID = message.author.id;

  //if there is a mention return, as this command is for personal use only
  if (message.mentions.members.first())
    return {
      status: true,
      message: ":x: Error: You may not view other users profiles",
    };

  let doc = await db
    .collection("users")
    .where("discordId", "==", discordID)
    .get();
  doc = doc.docs;
  if (doc.length === 0) {
    return {
      status: false,
      message: `:x: Could not find user`,
    };
  }

  doc = doc[0].data();

  let pbObj = doc.personalBests;

  let maxesTime;
  try {
    maxesTime = Object.fromEntries(
      Object.entries(pbObj.time).map(([key, array]) => [
        key,
        Math.max(...array.map(({ wpm }) => wpm)),
      ])
    );
  } catch (error) {
    maxesTime = null;
    message.channel.send(
      `:x: ${message.author.username}, you have no timed highscores`
    );
  }

  let maxesWords;
  try {
    maxesWords = Object.fromEntries(
      Object.entries(pbObj.words).map(([key, array]) => [
        key,
        Math.max(...array.map(({ wpm }) => wpm)),
      ])
    );
  } catch (error) {
    maxesWords = null;
    message.channel.send(
      `:x: ${message.author.username}, you have no word highscores`
    );
  }

  //embeds that display records
  let scoreTimeEmbed;
  if (maxesTime !== null) {
    scoreTimeEmbed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Time Personal Bests for ${message.author.username}`)
      .setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/alarm-clock_23f0.png"
      )
      .setFooter("www.monkey-type.com");
    verifyTimeDefined(15);
    verifyTimeDefined(30);
    verifyTimeDefined(60);
    verifyTimeDefined(120);
    message.channel.send(scoreTimeEmbed);
  }

  let scoreWordsEmbed;
  if (maxesWords !== null) {
    scoreWordsEmbed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Word Personal Bests for ${message.author.username}`)
      .setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/clipboard_1f4cb.png"
      )
      .setFooter("www.monkey-type.com");
    verifyWordDefined(10);
    verifyWordDefined(25);
    verifyWordDefined(50);
    verifyWordDefined(100);
    message.channel.send(scoreWordsEmbed);
  }

  return {
    status: true,
    message: "",
  };

  //functions for adding fields and finding values (some of which are a nightmare)

  function findWordRaw(val) {
    let timeVal = val;
    let rawToFind = maxesWords[val];
    let { raw } = pbObj.words[timeVal].find(({ wpm }) => wpm === rawToFind);
    return raw;
  }

  function findTimeRaw(val) {
    let timeVal = val;
    let rawToFind = maxesTime[val];
    let { raw } = pbObj.time[timeVal].find(({ wpm }) => wpm === rawToFind);
    return raw;
  }

  function findWordAcc(val) {
    let timeVal = val;
    let accToFind = maxesWords[val];
    let { acc } = pbObj.words[timeVal].find(({ wpm }) => wpm === accToFind);
    return acc;
  }

  function findTimeAcc(val) {
    let timeVal = val;
    let accToFind = maxesTime[val];
    let { acc } = pbObj.time[timeVal].find(({ wpm }) => wpm === accToFind);
    return acc;
  }

  function verifyTimeDefined(element) {
    if (maxesTime[element]) {
      let wpm = maxesTime[element];
      let raw = findTimeRaw(element);
      let acc = findTimeAcc(element);

      let rawText = raw === undefined ? "" : ` (${raw} raw)`;
      let accText = acc === undefined ? "" : ` ${acc}% accuracy`;
      scoreTimeEmbed.addField(
        `${element} sec`,
        `${wpm} wpm${rawText}${accText}`
      );
    }
  }

  function verifyWordDefined(element) {
    if (maxesWords[element]) {
      let wpm = maxesWords[element];
      let raw = findWordRaw(element);
      let acc = findWordAcc(element);

      let rawText = raw === undefined ? "" : ` (${raw} raw)`;
      let accText = acc === undefined ? "" : ` ${acc}% accuracy`;

      scoreWordsEmbed.addField(
        `${element} words`,
        `${wpm} wpm${rawText}${accText}`
      );
    }
  }
};

module.exports.cmd = {
  name: "pb",
  needMod: false,
  onlyBotCommandsChannel: true,
};
