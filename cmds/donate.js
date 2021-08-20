const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const fs = require("fs").promises;

  const targetUser = message.mentions.users.first();
  // const targetUserName = `${targetUser.username}#${targetUser.discriminator}`;
  const targetUserID = targetUser.id;

  const amount = Math.round(args[1]);

  let bananaData;
  try {
    bananaData = JSON.parse(await fs.readFile("bananas.json"));
  } catch (e) {
    return {
      status: true,
      message: ":x: No users found",
    };
  }
  try {
    if (isNaN(targetUser)) {
      return {
        status: false,
        message: `:x: Did you specify a user?`,
      };
    }

    if (isNaN(amount) || amount < 1) {
      return {
        status: false,
        message: `:x: You cannot donate for ${amount} bananas. Example: !donate <@user> 1`,
      };
    }

    targetData = bananaData[targetUserID];
    senderData = bananaData[message.author.id];

    if (senderData === undefined || senderData.balance === 0) {
      return {
        status: true,
        message: ":x: You have no bananas",
      };
    } else {
      if (amount > senderData.balance) {
        return {
          status: true,
          message: `:x: You don't have enough bananas to give to <@${targetUserID}>.`,
        };
      } else {
        bananaData = JSON.parse(await fs.readFile("bananas.json"));
        bananaData[message.author.id].balance -= amount;
        bananaData[targetUserID].balance += amount;

        await fs.writeFile("bananas.json", JSON.stringify(bananaData));

        return {
          status: true,
          message: `:partying_face: Successfully donated ${amount} bananas to <@${targetUserID}>.`,
        };
      }
    }
  } catch (e) {
    return {
      status: false,
      message: "Something went very wrong: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "donate",
  needMod: false,
  requiredChannel: "banana",
};
