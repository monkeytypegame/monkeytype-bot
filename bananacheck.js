const Discord = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  let whom = args[1]
  const fs = require("fs");
  try {
    // read in the banana.json data
    let bananaData;
    try {
      bananaData = JSON.parse(fs.readFileSync("bananas.json"));
    } catch (e) {
      fs.writeFileSync("bananas.json", '{}');
      bananaData = {};
    }
    // get the user
    let userData = bananaData[whom.id];
    let milisNow = Date.now();
    if (userData === undefined) {
      return {
        status: true,
        message: `${whom.username} is not found.`
      }
    } else {
      let embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`${whom.username}'s Bananas`)
      .setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
      )
        .setDescription(`Banana collected! Come back in ${timeLeftString} for more.`)
        .addField("Bananas",userData.balance)
        .setFooter("www.monkeytype.com");
      
      message.channel.send(embed);
      return {
        status: true,
        message: ''
      }
    }
  } catch (e) {
      return {
      status: false,
      message: "Something went wrong getting their banana balance: " + e.message,
      };
  }
};

module.exports.cmd = {
  name: "bananacheck",
  needMod: false,
  requiredChannel: "banana"
};
