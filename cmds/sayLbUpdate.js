const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  if (args.length !== 7) {
    return {
      status: false,
      message: "Error: Need exactly 7 arguments",
    };
  }

  const config = require("../config.json");
  const discordIdOrUsername = args[0];
  const pos = args[1];
  const lb = args[2];
  const wpm = args[3];
  const raw = args[4];
  const acc = args[5];
  const con = args[6];

  if (config.noLog !== undefined && config.noLog) {
    return {
      status: true,
      message: `:warning: Not logging due to config`,
    };
  }

  let posstr = "th";
  if (pos === 1) {
    posstr = "st";
  } else if (pos === 2) {
    posstr = "nd";
  } else if (pos === 3) {
    posstr = "rd";
  }

  try {
    let usrstring = `<@${discordIdOrUsername}>`;

    let found = guild.members.cache.find(
      (mem) => mem.user.id == discordIdOrUsername
    );
    if (found === undefined) {
      usrstring = discordIdOrUsername;
    }

    const embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Leaderboard Update`)
      .setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/star_2b50.png"
      )
      .setFooter("www.monkeytype.com")
      .setDescription(
        `${usrstring} just got ${pos}${posstr} place on the ${lb.replace(
          "_",
          " "
        )} leaderboard!`
      )
      .addFields(
        { name: "wpm", value: wpm, inline: true },
        { name: "raw", value: raw, inline: true },
        { name: "\u200B", value: "\u200B", inline: true },
        { name: "accuracy", value: acc + "%", inline: true },
        { name: "consistency", value: con + "%", inline: true },
        { name: "\u200B", value: "\u200B", inline: true }
      );

    if (
      config.channels.general !== null &&
      config.channels.general !== undefined
    ) {
      guild.channels.cache
        .find((ch) => ch.id === config.channels.general)
        .send(embed);
    }

    return {
      status: true,
      message: `${usrstring} ${pos}${posstr} ${lb.replace(
        "_",
        " "
      )} ${wpm} wpm`,
    };
  } catch (e) {
    return {
      status: false,
      message: `:x: Error while trying to announce leaderboard - ${e}`,
    };
  }
};

module.exports.cmd = {
  name: "sayLbUpdate",
  type: "db",
};
