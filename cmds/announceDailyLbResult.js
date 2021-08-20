const Discord = require("discord.js");
const { connectDB, mongoDB } = require("../mongodb.js");

module.exports.run = async (bot, message, args, guild) => {
  await connectDB();
  console.log(`Running command ${this.cmd.name}`);

  if (args.length !== 1) {
    return {
      status: false,
      message: "Error: Need exactly 1 argument",
    };
  }

  const config = require("../config.json");
  const lb = args[0];
  const winner = lb.board[0];

  if (config.noLog !== undefined && config.noLog) {
    return {
      status: true,
      message: `Not logging due to config`,
    };
  }

  try {
    return mongoDB.collection("users").findOne({ uid: winner.uid }).then((docdata) => {
        let name = docdata.name;
        let discordId = docdata.discordId;

        const embed = new Discord.MessageEmbed()
          .setColor("#e2b714")
          .setTitle(
            `Daily ${lb.mode} ${lb.mode2} Leaderboard Winner‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏`
          )
          .setThumbnail(
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/crown_1f451.png"
          )
          .setFooter("www.monkeytype.com");

        if (discordId !== undefined) {
          //not paired, go by name
          // guild.channels.cache
          //   .find((ch) => ch.id === config.channels.general)
          //   .send(
          //     `<@${discordId}> has won the daily ${lb.mode} ${lb.mode2} leaderboard with ${winner.wpm} wpm (${winner.raw} raw) and ${winner.acc}% accuracy.`
          //   );
          embed.setDescription(
            `<@${discordId}> has won the daily ${lb.mode} ${lb.mode2} leaderboard!`
          );
          embed.addFields(
            { name: "wpm", value: winner.wpm, inline: true },
            { name: "raw", value: winner.raw, inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "accuracy", value: winner.acc + "%", inline: true },
            { name: "consistency", value: winner.consistency + "%", inline: true },
            { name: "\u200B", value: "\u200B", inline: true }
          );
        } else {
          //paired, tag the user
          // guild.channels.cache
          //   .find((ch) => ch.id === config.channels.general)
          //   .send(
          //     `**${name}** has won the daily ${lb.mode} ${lb.mode2} leaderboard with ${winner.wpm} wpm (${winner.raw} raw) and ${winner.acc}% accuracy.`
          //   );
          embed.setDescription(
            `**${name}** has won the daily ${lb.mode} ${lb.mode2} leaderboard!`
          );
          embed.addFields(
            { name: "wpm", value: winner.wpm, inline: true },
            { name: "raw", value: winner.raw, inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "accuracy", value: winner.acc + "%", inline: true },
            { name: "consistency", value: winner.consistency + "%", inline: true },
            { name: "\u200B", value: "\u200B", inline: true }
          );
        }
        guild.channels.cache
          .find((ch) => ch.id === config.channels.general)
          .send(embed);

        guild.channels.cache
          .find((ch) => ch.id === config.channels.general)
          .send(
            `<@${discordId}> You won the daily ${lb.mode} ${lb.mode2} leaderboard!`
          )
          .then((msg) => {
            msg.delete({ timeout: 500 });
          });

        return {
          status: true,
          message: `Logged daily lb result for ${lb.mode} ${lb.mode2}`,
        };
    });
  } catch (e) {
    return {
      status: false,
      message: `Error while trying to announce leaderboard - ${e}`,
    };
  }

  function logInChannel(message) {
    if (
      config.channels.botLog !== null &&
      config.channels.botLog !== undefined
    ) {
      guild.channels.cache
        .find((ch) => ch.id === config.channels.botLog)
        .send(message);
    }
  }
};

module.exports.cmd = {
  name: "announceDailyLbResult",
  type: "db",
};
