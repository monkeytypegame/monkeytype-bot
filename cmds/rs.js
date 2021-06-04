const Discord = require("discord.js");
const fetch = require("node-fetch");
const axiosInstance = require("../axiosInstance");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let discordID = message.author.id;
  const config = require("../config.json");
  if (config.noLog) {
    return {
      status: false,
      message: "",
    };
  }
  //if there is a mention return, as this command is for personal use only
  if (message.mentions.members.first())
    return {
      status: true,
      message: ":x: Error: You may not view other users profiles",
    };

  let userResponse = await axiosInstance.get(`/getRecentScore/${discordID}`)
  if (userResponse.data.error) {
    return {
      status: false,
      message: `:x: Could not find user. Make sure your accounts are paired.`,
    };
  }
  let rs = userResponse.data.recentScore;

  if (rs === -1) {
    return {
      status: false,
      message: ":x: No recent score found."
    }
  }

  const language = rs.language ?? "english";

  if (rs.mode === "time" || rs.mode === "words") {
    const mode = rs.mode === "time" ?
      rs.mode2 + " sec" : rs.mode2 + " " + rs.mode;

    const embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Recent Score for ${message.author.username}`)
      .addField(
        mode,
        `${rs.wpm} wpm (${rs.rawWpm} raw) ${rs.acc}% accuracy, ${rs.consistency}% consistency`
        + `\nLanguage: ${language}`
      )
      .setFooter("www.monkeytype.com");
    message.channel.send(embed);
  } else {
    const res = await fetch(
      `https://raw.githubusercontent.com/Miodec/monkeytype/master/static/quotes/${language}.json`
    );
    const json = await res.json();
    const quote = json.quotes.find(quote => quote.id === rs.mode2);
    const { text, source } = quote;

    const embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Recent Score for ${message.author.username}`)
      .setDescription(
        `${rs.wpm} wpm (${rs.rawWpm} raw) ${rs.acc}% accuracy, ${rs.consistency}% consistency`
      )
      .addField(
        "Quote",
        `\`\`\`\n${text}\n\`\`\`\nSource: ${source}\nLanguage: \`${language}\``
      )
      .setFooter("www.monkeytype.com");
    message.channel.send(embed);
  }

  return {
    status: true,
    message: "",
  };
};

module.exports.cmd = {
  name: "rs",
  needMod: false,
  requiredChannel: "botCommands",
};
