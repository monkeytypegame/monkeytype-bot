const Discord = require("discord.js");

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

  //embeds that display records

  message.channel.send(
    `**Timed Personal Bests for ${message.author.username}**`
  );

  const scoreTimeEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setThumbnail(
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/263/chart-increasing_1f4c8.png"
    )
    .setTimestamp()
    .setFooter("https://monkey-type.com/");
  verifyTimeDefined(15);
  verifyTimeDefined(30);
  verifyTimeDefined(60);
  verifyTimeDefined(120);
  message.channel.send(scoreTimeEmbed);

  message.channel.send(
    `**Word Personal Bests for ${message.author.username}**`
  );

  const scoreWordsEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setThumbnail(
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/clipboard_1f4cb.png"
    )
    .setTimestamp()
    .setFooter("https://monkey-type.com/");
  verifyWordDefined(10);
  verifyWordDefined(25);
  verifyWordDefined(50);
  verifyWordDefined(100);
  message.channel.send(scoreWordsEmbed);

  return {
    status: true,
    message: '',
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

      let rawText = raw === undefined ? '' : ` (${raw} raw)`;
      let accText = acc === undefined ? '' : ` ${acc}% accuracy`;

      scoreTimeEmbed.addField(
        `**${element} sec**`,
        `${wpm} wpm${rawText}${accText}`
      );
      // scoreTimeEmbed.addField(`Raw:`, `${findTimeRaw(element) === undefined ?'-':findTimeRaw(element)} wpm`, true);
      // scoreTimeEmbed.addField(`Accuracy:`, `${findTimeAcc(element)}%`, true);
      //scoreTimeEmbed.addField(`\u200b`, `\u200b`);
    }
  }

  function verifyWordDefined(element) {
    if (maxesWords[element]) {
      let wpm = maxesWords[element];
      let raw = findWordRaw(element);
      let acc = findWordRaw(element);

      let rawText = raw === undefined ? '' : ` (${raw} raw)`;
      let accText = acc === undefined ? '' : ` ${acc}% accuracy`;

      scoreWordsEmbed.addField(
        `**${element} words**`,
        `${wpm} wpm${rawText}${accText}`
      );
      // scoreWordsEmbed.addField(`Raw:`, `${findWordRaw(element) === undefined ?'-':findWordRaw(element)} wpm`, true);
      // scoreWordsEmbed.addField(`Accuracy:`, `${findWordAcc(element)}%`, true);
      //scoreWordsEmbed.addField(`\u200b`, `\u200b`);
    }
  }
};

module.exports.cmd = {
  name: "pb",
  needMod: false,
};
