const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  // if (config.noLog) {
  //   return {
  //     status: false,
  //     message: "",
  //   };
  // }
  const fs = require("fs").promises;
  try {
    let bananaData;
    try {
      bananaData = JSON.parse(await fs.readFile("bananas.json"));
    } catch (e) {
      bananaData = {};
    }
    if (bananaData.length === 0) {
      return {
        status: true,
        message: ":x: No users found",
      };
    } else {
      let dekeyd = [];
      Object.keys(bananaData).map(function (key, index) {
        dekeyd.push({
          id: key,
          balance: bananaData[key].balance,
          lastCollect: bananaData[key].lastCollect,
        });
      });
      let sorted = dekeyd.sort((a, b) => {
        if (a.balance === b.balance) {
          return a.lastCollect - b.lastCollect;
        } else {
          return b.balance - a.balance;
        }
      });
      let sliced = sorted.slice(0, 10);
      sliced.forEach((slice) => {
        let name;
        try {
          if (slice.id === bot.user.id) {
            name = "George";
          } else {
            name = guild.members.cache.find((member) => member.id === slice.id)
              .user.username;
          }
        } catch (e) {
          name = "Unknown User";
        }
        slice.name = name;
      });
      let top10string = "";
      sliced.forEach((user) => {
        top10string += `${user.name} - ${user.balance}\n`;
      });
      let embed = new Discord.MessageEmbed()
        .setColor("#e2b714")
        .setTitle(`Top 10 Banana Hoarders`)
        .setThumbnail(
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        )
        .setDescription(top10string)
        .setFooter("www.monkeytype.com");

      message.channel.send(embed);
      return {
        status: true,
        message: "",
      };
    }
  } catch (e) {
    return {
      status: false,
      message:
        "Something went wrong when getting top banana hoarders: " + e.message,
    };
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
};

module.exports.cmd = {
  name: "bananatop",
  needMod: false,
  requiredChannel: "banana",
};
