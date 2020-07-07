// require packages
const Discord = require("discord.js");
const fs = require("fs");
require("dotenv/config");

// initialise are bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// import bot setting
let prefix = "!";
const config = require("./config.json");

// initialise firebase
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
var guild;

//read commands files
fs.readdir("./cmds", (err, files) => {
  if (err) {
    console.log(err);
  }

  let cmdFiles = files.filter((f) => f.split(".").pop() === "js");

  if (cmdFiles.length === 0) {
    console.log("No files found");
    return;
  }

  cmdFiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} loaded`);
    bot.commands.set(props.cmd.name, props);
  });
});

//react to dms
bot.on("message", (msg) => {
  if (msg.channel.type !== "dm") return;
  if (msg.author.bot) return;

  let msg_array = msg.content.split(" ");
  let cmd = msg_array[0];
  let args = msg_array.slice(1);

  if (!cmd.startsWith(prefix)) return;

  let cmdObj = bot.commands.get(cmd.slice(prefix.length));

  if (!cmdObj || cmdObj.cmd.type !== "dm") return;

  cmdObj.run(bot, msg, args, db, guild).then((result) => {
    if (result.status) {
      msg.channel.send(result.message);
    } else {
      msg.channel.send(result.message);
    }
  });
});

//react to messages
bot.on("message", (msg) => {
  if (msg.channel.type === "dm") return; //dont react to dms
  if (msg.author.bot) return; //dont react to messages by the bot

  let msg_array = msg.content.split(" ");
  let cmd = msg_array[0]; //gets the first element eg "!verify" if the message is "!verify someone"
  let args = msg_array.slice(1); //gets the arguments eg "this that " if the message is "!do this that"

  if (cmd.slice(prefix.length).substr(0, 2) == "db") return; //dont react to db functions in the chat

  if (!cmd.startsWith(prefix)) return; //stop if the command doesnt start with the prefix

  let cmdObj = bot.commands.get(cmd.slice(prefix.length)); //gets the command based on its name

  if (
    !msg.member.roles.cache.some(
      (role) =>
        role.id === config.roles.adminRole || role.id === config.roles.modRole
    )
  ) {
    msg.channel.send(`You are not a moderator`);
    return;
  }

  if (!cmdObj) {
    msg.channel.send(`Command ${cmd} doesnt exist`);
    return;
  }

  if (cmdObj.cmd.type === "dm" || cmdObj.cmd.type === "db") {
    msg.channel.send(`Command ${cmd} cannot be executed manually`);
    return;
  }

  cmdObj.run(bot, msg, args, db, guild).then((result) => {
    console.log(result);
    if (result.status) {
      msg.channel.send(result.message);
    } else {
      msg.channel.send(result.message);
    }
  });
});

// Bot login
bot.login(config.token);

bot.on("ready", async () => {
  console.log("Ready");
  guild = bot.guilds.cache.get(config.guildId);

  db.collection("bot-commands").onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();

    changes.forEach((change) => {
      let docData = change.doc.data();
      if (docData.executed === false) {
        let cmd = docData.command;
        let args = docData.arguments;
        let cmdObj = bot.commands.get(cmd); //gets the command based on its name
        if (cmdObj) {
          if (cmdObj.cmd.type !== "db") return;
          cmdObj.run(bot, null, args, db, guild).then((result) => {
            if (result.status) {
              db.collection("bot-commands").doc(change.doc.id).update({
                executed: true,
                executedTimestamp: Date.now(),
              });
              console.log(`Command ${cmd} complete. Updating database`);
              console.log(result.message);
              logInChannel(result.message);
            } else {
              console.log(result.message);
            }
          });
        }
      }
    });
  });
});

function logInChannel(message) {
  if (config.logChannel !== null && config.logChannel !== undefined) {
    guild.channels.cache
      .find((ch) => ch.id === config.logChannel)
      .send(message);
  }
}
