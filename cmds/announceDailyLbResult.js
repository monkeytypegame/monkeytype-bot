module.exports.run = async (bot, message, args, db, guild) => {
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
    return db
      .collection("users")
      .doc(winner.uid)
      .get()
      .then((doc) => {
        let docdata = doc.data();
        let name = docdata.name;
        let discordId = docdata.discordId;

        if (discordId !== undefined) {
          //not paired, go by name
          guild.channels.cache
            .find((ch) => ch.id === config.channels.general)
            .send(
              `<@${discordId}> has won the daily ${lb.mode} ${lb.mode2} leaderboard with ${winner.wpm} wpm (${winner.raw} raw) and ${winner.acc}% accuracy.`
            );
          return {
            status: true,
            message: `Logged daily lb result for ${lb.mode} ${lb.mode2}`,
          };
        } else {
          //paired, tag the user
          guild.channels.cache
            .find((ch) => ch.id === config.channels.general)
            .send(
              `**${name}** has won the daily ${lb.mode} ${lb.mode2} leaderboard with ${winner.wpm} wpm (${winner.raw} raw) and ${winner.acc}% accuracy.`
            );
          return {
            status: true,
            message: `Logged daily lb result for ${lb.mode} ${lb.mode2}`,
          };
        }
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
