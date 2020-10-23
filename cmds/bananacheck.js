const Discord = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);
    const fs = require("fs");

    const targetUser = message.mentions.users.first();
    const targetUserName = `${targetUser.username}#${targetUser.discriminator}`;
    const targetUserID = targetUser.id;
    

    let bananaData;
    try {
        bananaData = JSON.parse(fs.readFileSync("bananas.json"));
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
        
        userData = bananaData[targetUserID];
        if (userData === undefined || userData.balance === 0) {
            message.channel.send({
                "embed": {
                  "color": 16118072,
                  "footer": {
                    "text": "www.monkeytype.com"
                  },
                  "thumbnail": {
                    "url": targetUser.avatarURL()
                  },
                  "author": {
                    "name": `${targetUserName}'s balance`
                  },
                  "description": "**Wallet:** 0 bananas :(\n**Bank**: N/A\n**Total**: 0 bananas"
                }
              })
        } else {
            message.channel.send({
                "embed": {
                  "color": 16118072,
                  "footer": {
                    "text": "www.monkeytype.com"
                  },
                  "thumbnail": {
                    "url": targetUser.avatarURL()
                  },
                  "author": {
                    "name": `${targetUserName}'s balance`
                  },
                  "description": `**Wallet:** ${userData.balance} bananas\n**Bank**: N/A\n**Total**: ${userData.balance} bananas`
                }
              })
        }
            
    } catch (e) {
        return {
            status: false,
            message: "Something went very wrong: " + e.message,
        };
    }

};

module.exports.cmd = {
    name: "bananacheck",
    needMod: false,
    requiredChannel: "banana"
};
