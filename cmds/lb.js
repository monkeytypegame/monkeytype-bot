const Discord = require("discord.js");
const AsciiTable = require("ascii-table");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  if (config.noLog) {
    return {
      status: false,
      message: ""
    };
  }

  args = args.map(arg => arg.toLowerCase());
  if (!args.join(" ").match(/(15|60) (daily|global)/)) {
    return {
      status: true,
      message: ":x: Error: Invalid command usage. `!lb <15/60> <daily/global>` | Example: `!lb 15 global`"
    };
  }

  const [mode2, type] = args;
  let data = await db.collection("leaderboards").doc(`time_${mode2}_${type}`).get();
  data = data.data();
  const leaderboard = new AsciiTable().setHeading("", "Name", "Stats");

  const doc = await db
    .collection("users")
    .where("discordId", "==", message.author.id)
    .get();

  if (doc.docs.length !== 0) {
    const uid = doc.docs[0].id;
    const position = data.board.map(user => user.uid).indexOf(uid);
    const user = data.board[position];

    if (position !== -1) {
      leaderboard.addRow(position + 1, "YOU", `${user.wpm} wpm ${user.acc}% accuracy`);
      leaderboard.addRow("", "", "");
    }
  }

  data.board.length = 10;
  data.board.forEach((user, i) =>
    leaderboard.addRow(i + 1, user.name, `${user.wpm} wpm ${user.acc}% accuracy`)
  );

  const embed = new Discord.MessageEmbed()
    .setColor("#e2b714")
    .setTitle(`Leaderboard for ${mode2} sec ${type}`)
    .setDescription("```\n" + leaderboard.toString() + "\n```")
    .setFooter("www.monkeytype.com");
  await message.channel.send(embed);

  return {
    status: true,
    message: ""
  };
};

module.exports.cmd = {
  name: "lb",
  needMod: false,
  requiredChannel: "botCommands"
};
