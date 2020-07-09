const { GuildMember } = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  if (args.length !== 4) {
    return {
      status: false,
      message: "Error: Need exactly 4 arguments",
    };
  }

  const config = require("../config.json");
  const discordId = args[0];
  const pos = args[1];
  const lb = args[2];
  const wpm = args[3];

  let posstr = "th";
  if (pos === 1) {
    posstr = "st";
  } else if (pos === 2) {
    posstr = "nd";
  } else if (pos === 3) {
    posstr = "rd";
  }

  try {
    if (
      config.channels.general !== null &&
      config.channels.general !== undefined
    ) {
      guild.channels.cache
        .find((ch) => ch.id === config.channels.general)
        .send(
          `<@${discordId}> just got ${pos}${posstr} place on the ${lb.replace(
            "_",
            " "
          )} leaderboard with a speed of ${wpm} wpm.`
        );
    }

    return {
      status: true,
      message: `<@${discordId}> ${pos}${posstr} ${lb.replace(
        "_",
        " "
      )} ${wpm} wpm`,
    };
  } catch (e) {
    return {
      status: false,
      message: `Error while trying to announce leaderboard - ${e}`,
    };
  }
};

module.exports.cmd = {
  name: "sayLbUpdate",
  type: "db",
};
