const Discord = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let discordID = message.author.id;

  //if there is a mention return, as this command is for personal use only
  if (message.mentions.members.first()) return message.channel.send("Error: You may not view other users profiles");

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

  let pbObj = doc.globalStats;

  //embeds that display records

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

  const statsEmbed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setTitle(`Typing Stats for ${message.author.username}`)
    .setThumbnail(
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/alarm-clock_23f0.png"
    )
    .addField("Tests Started:", `${pbObj.started}`)
    .addField("Tests Completed:", `${pbObj.completed}`)
    .addField("Time Typing:", `${secondsToHms(pbObj.time)}`)
    .setFooter("www.monkey-type.com");
  message.channel.send(statsEmbed);
};

module.exports.cmd = {
  name: "stats",
  needMod: false,
  onlyBotCommandsChannel: true
};