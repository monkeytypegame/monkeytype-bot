const Discord = require("discord.js");
const fetch = require("node-fetch");
const { connectDB, mongoDB } = require("../mongodb.js");

module.exports.run = async (bot, message, args, guild) => {
  await connectDB();
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

  let user = await mongoDB().collection("users").findOne({ discordId: discordID })
  if (!user) {
    return {
      status: false,
      message: `:x: Could not find user. Make sure your accounts are paired.`,
    };
  }

  doc = await mongoDB().collection("results").findOne({ name: user.name})
  // Use the line commented below if the above line doesn't return the most recent result
  //doc = await mongoDB().collection("results").find({ name: doc.name}).limit(1).sort({$natural:-1})
  if (!doc) {
    return {
      status: false,
      message: ":x: No recent score found."
    }
  }

  const language = doc.language ?? "english";

  if (doc.mode === "time" || doc.mode === "words") {
    const mode = doc.mode === "time" ?
      doc.mode2 + " sec" : doc.mode2 + " " + doc.mode;

    const embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Recent Score for ${message.author.username}`)
      .addField(
        mode,
        `${doc.wpm} wpm (${doc.rawWpm} raw) ${doc.acc}% accuracy, ${doc.consistency}% consistency`
        + `\nLanguage: ${language}`
      )
      .setFooter("www.monkeytype.com");
    message.channel.send(embed);
  } else {
    const res = await fetch(
      `https://raw.githubusercontent.com/Miodec/monkeytype/master/static/quotes/${language}.json`
    );
    const json = await res.json();
    const quote = json.quotes.find(quote => quote.id === doc.mode2);
    const { text, source } = quote;

    const embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`Recent Score for ${message.author.username}`)
      .setDescription(
        `${doc.wpm} wpm (${doc.rawWpm} raw) ${doc.acc}% accuracy, ${doc.consistency}% consistency`
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
