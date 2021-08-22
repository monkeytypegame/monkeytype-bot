const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const bananaBet = Math.round(args[0]);
  let sidePrediction = args[1];
  const fs = require("fs").promises;
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
    if (isNaN(bananaBet) && sidePrediction === undefined) {
      //show last 10 flips
      let flipData;
      try {
        flipData = JSON.parse(await fs.readFile("coinFlips.json"));
      } catch (e) {
        flipData = [];
      }

      if (flipData.length < 10) {
        for (let i = 0; i < 10 - flipData.length + 1; i++) {
          const flip = Math.round(Math.random());
          const flipString = flip === 0 ? "h" : "t";
          flipData.push(flipString);
        }
      } else if (flipData.length > 10) {
        //get last 10
        flipData = flipData.slice(flipData.length - 10);
      }

      await fs.writeFile("coinFlips.json", JSON.stringify(flipData));

      let lastFlipsString = "";
      flipData.forEach((flip) => {
        lastFlipsString += flip.toUpperCase() + " ";
      });

      //https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/slot-machine_1f3b0.png
      let embed = new Discord.MessageEmbed()
        .setColor("#e2b714")
        .setTitle(`Last 10 Global Flips`)
        .setThumbnail(
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/slot-machine_1f3b0.png"
        )
        .setDescription(lastFlipsString)
        .addField(
          `${message.author.username}'s Available Balance`,
          bananaData[message.author.id].balance
        )
        .addField(
          "Flip Wins",
          bananaData[message.author.id].flipWins === undefined
            ? 0
            : bananaData[message.author.id].flipWins,
          true
        )
        .addField(
          "Flip Losses",
          bananaData[message.author.id].flipLosses === undefined
            ? 0
            : bananaData[message.author.id].flipLosses,
          true
        )
        .setFooter("www.monkeytype.com");
      message.channel.send(embed);

      return {
        status: true,
        message: "",
      };
    } else {
      if (isNaN(bananaBet)) {
        return {
          status: false,
          message: `:x: Can't flip for ${bananaBet} bananas. Example: !bananaflip 1 heads`,
        };
      }
      if (bananaBet < 1) {
        return {
          status: false,
          message: `:x: Can't flip for ${bananaBet} bananas. Example: !bananaflip 1 heads`,
        };
      }
      try {
        sidePrediction = sidePrediction.toLowerCase();
        if (!/^[ht]/.test(sidePrediction)) {
          throw "Doesnt begin with h or t";
        } else {
          sidePrediction = sidePrediction.substring(0, 1);
        }
        if (sidePrediction !== "h" && sidePrediction !== "t") {
          throw "Doesnt begin with h or t";
        }
      } catch (e) {
        console.log(e);
        return {
          status: false,
          message: `:x: Side prediction must be a string and begin with either h or t. Example: !bananaflip 1 tails or !bananaflip 1 h`,
        };
      }

      let flipData;
      try {
        flipData = JSON.parse(await fs.readFile("coinFlips.json"));
      } catch (e) {
        flipData = [];
      }
      userData = bananaData[message.author.id];
      if (userData === undefined || userData.balance === 0) {
        return {
          status: true,
          message: ":x: You have no bananas",
        };
      } else {
        if (bananaBet > userData.balance) {
          return {
            status: true,
            message: ":x: You don't have enough bananas.",
          };
        } else {
          //flip a coin
          const flip = Math.round(Math.random());
          const flipString = flip === 0 ? "h" : "t";

          bananaData = JSON.parse(await fs.readFile("bananas.json"));
          if (sidePrediction === flipString) {
            //correct guess
            bananaData[message.author.id].balance += bananaBet;
            if (bananaData[message.author.id].flipWins === undefined) {
              bananaData[message.author.id].flipWins = 1;
            } else {
              bananaData[message.author.id].flipWins++;
            }
          } else {
            //incorrect guess
            bananaData[message.author.id].balance -= bananaBet;
            bananaData[bot.user.id].balance += bananaBet;
            if (bananaData[message.author.id].flipLosses === undefined) {
              bananaData[message.author.id].flipLosses = 1;
            } else {
              bananaData[message.author.id].flipLosses++;
            }
          }

          //save file
          await fs.writeFile("bananas.json", JSON.stringify(bananaData));

          //save last flips
          flipData.push(flipString);
          flipData = flipData.slice(flipData.length - 10);
          await fs.writeFile("coinFlips.json", JSON.stringify(flipData));

          let resultString = flip === 0 ? "heads" : "tails";

          let countString = bananaBet === 1 ? "banana" : "bananas";

          let lastFlipsString = "";
          flipData.forEach((flip) => {
            lastFlipsString += flip.toUpperCase() + " ";
          });

          if (sidePrediction === flipString) {
            let embed = new Discord.MessageEmbed()
              .setColor("#41fd5f")
              .setTitle(`Flipping for ${message.author.username}...`)
              .setThumbnail(
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
              )
              .setDescription(
                `It's ${resultString}! ${message.author.username} won ${bananaBet} ${countString}.`
              )
              .addField("Last 10 Global Flips", lastFlipsString)
              .addField("New Balance", bananaData[message.author.id].balance)
              .addField(
                "Flip Wins",
                bananaData[message.author.id].flipWins === undefined
                  ? 0
                  : bananaData[message.author.id].flipWins,
                true
              )
              .addField(
                "Flip Losses",
                bananaData[message.author.id].flipLosses === undefined
                  ? 0
                  : bananaData[message.author.id].flipLosses,
                true
              )
              .setFooter("www.monkeytype.com");
            message.channel.send(embed);

            return {
              status: true,
              message: ``,
            };
          } else {
            let embed = new Discord.MessageEmbed()
              .setColor("#fd4141")
              .setTitle(`Flipping for ${message.author.username}...`)
              .setThumbnail(
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/cross-mark_274c.png"
              )
              .setDescription(
                `It's ${resultString}! ${message.author.username} lost ${bananaBet} ${countString}.`
              )
              .addField("Last 10 Global Flips", lastFlipsString)
              .addField("New Balance", bananaData[message.author.id].balance)
              .addField(
                "Flip Wins",
                bananaData[message.author.id].flipWins === undefined
                  ? 0
                  : bananaData[message.author.id].flipWins,
                true
              )
              .addField(
                "Flip Losses",
                bananaData[message.author.id].flipLosses === undefined
                  ? 0
                  : bananaData[message.author.id].flipLosses,
                true
              )
              .setFooter("www.monkeytype.com");
            message.channel.send(embed);

            return {
              status: true,
              message: ``,
            };
          }
        }
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
  name: "bananaflip",
  needMod: false,
  requiredChannel: "banana",
};
