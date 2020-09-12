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

  //embeds that display records

  const scoreEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }))
    .setTimestamp()
    .setFooter('https://monkey-type.com')
    .setTitle(`Personal Bests for ${message.author.username}`)
    .addField("**__Time Personal Bests:__**")
  verifyTimeDefined(15)
  verifyTimeDefined(30)
  verifyTimeDefined(60)
  verifyTimeDefined(120)
  .addField("**__Word Personal Bests:__**")
  verifyWordDefined(10)
  verifyWordDefined(25)
  verifyWordDefined(50)
  verifyWordDefined(100)
  message.channel.send(scoreEmbed);
  return {
    status: true,
    message: ``,
  };

  //functions for adding fields and finding values

  function findTimeRaw(val) {
    let val = maxesTime[val]
    let {raw} = pbObj.time[val].find(({wpm})=>wpm===val);
    return raw
  }

  function findWordRaw(val) {
    let val = maxesWords[val]
    let {raw} = pbObj.words[val].find(({wpm})=>wpm===val);
    return raw
  }

  function verifyTimeDefined(element) {
    if (maxesTime[element]) {
      scoreEmbed.addField(`${element}s Highscore:`, `${maxesTime[element]} wpm`);
      scoreEmbed.addField(`raw:`, `${findTimeRaw[element]}`, true);
    }
  }

  function verifyWordDefined(element) {
    if (maxesWords[element]) {
      scoreEmbed.addField(`${element}s Highscore:`, `${maxesWords[element]} wpm`);
      scoreEmbed.addField(`raw:`, `${findWordRaw[element]}`, true);
    }
  }

};

module.exports.cmd = {
  name: "pb",
  needMod: false,
  onlyBotCommandsChannel: true
};
