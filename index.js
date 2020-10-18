// require packages
const Discord = require("discord.js");
const fs = require("fs");

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

// //react to dms
// bot.on("message", (msg) => {
//   if (msg.channel.type !== "dm") return;
//   if (msg.author.bot) return;

//   let msg_array = msg.content.split(" ");
//   let cmd = msg_array[0];
//   let args = msg_array.slice(1);

//   if (!cmd.startsWith(prefix)) return;

//   let cmdObj = bot.commands.get(cmd.slice(prefix.length));

//   if (!cmdObj || cmdObj.cmd.type !== "dm") return;

//   msg.channel.send("Please wait...");
//   cmdObj.run(bot, msg, args, db, guild).then((result) => {
//     if (result.status) {
//       msg.channel.send(result.message);
//     } else {
//       msg.channel.send(result.message);
//     }
//   });
// });

let lastReact = 0;
function shouldBotReact() {
  if (Date.now() - lastReact >= 3000) {
    lastReact = Date.now();
    return true;
  } else {
    return false;
  }
}

//react to messages
bot.on("message", (msg) => {
  if (msg.channel.type === "dm") return; //dont react to dms
  if (msg.author.bot) return; //dont react to messages by the bot

  if (msg.member.roles.cache.some(
    (role) =>
      role.id === config.roles.adminRole || role.id === config.roles.modRole
  ) && msg.content.toLowerCase() === "ping") {
    msg.channel.send("pong");
    return;
  }

  if (msg.mentions.has(bot.user)) {
    if (/(shut *up|stfu|sh+|bad)/g.test(msg.content.toLowerCase())) {
      if (Math.round(Math.random()) === 1) {
        msg.channel.send(":(");
      } else {
        msg.channel.send(":hmph:");
      }
    }
    if (/(good|nice|thanks|good job|ty)/g.test(msg.content.toLowerCase())) {
      msg.channel.send(":)");
    }
    return;
  }

  if (/(how.*role.*\?)|(how.*challenge.*\?)|(wpm role.*\?)|(pair.*account.*\?)/g.test(msg.content.toLocaleLowerCase())) {
    msg.channel.send(`Hey <@${msg.author.id}>, checkout the <#741305227637948509> channel.`);
  }

  let msg_array = msg.content.split(" ");
  let cmd = msg_array[0]; //gets the first element eg "!verify" if the message is "!verify someone"
  let args = msg_array.slice(1); //gets the arguments eg "this that " if the message is "!do this that"

  if (cmd.slice(prefix.length).substr(0, 2) == "db") return; //dont react to db functions in the chat

  if (!cmd.startsWith(prefix)) return; //stop if the command doesnt start with the prefix

  if (/[!]+$/g.test(cmd)) return; //dont react to only ! messages

  let cmdObj = bot.commands.get(cmd.slice(prefix.length)); //gets the command based on its name

  if (!cmdObj) {
    // msg.channel.send(`Command ${cmd} doesnt exist`);
    return;
  }



  if (
    !msg.member.roles.cache.some(
      (role) =>
        role.id === config.roles.adminRole || role.id === config.roles.modRole
    ) &&
    cmdObj.cmd.needMod === true
  ) {
    // msg.channel.send(`You are not a moderator`);
    return;
  }

  if (!shouldBotReact()) {
    msg.channel.send("Please wait a bit before using a commmand");
    return;
  }

  if (cmdObj.cmd.onlyBotCommandsChannel && msg.channel.id !== config.channels.botCommands) {
    msg.channel.send(`Please use the <#${config.channels.botCommands}> channel.`);
    setTimeout(() => {
      msg.delete();
    }, 500);
    return;
  }

  if (cmdObj.cmd.type === "dm" || cmdObj.cmd.type === "db") {
    msg.channel.send(`Command ${cmd} cannot be executed manually`);
    setTimeout(() => {
      msg.delete();
    }, 500);
    return;
  }

  cmdObj.run(bot, msg, args, db, guild).then((result) => {
    console.log(result);
    if (result.status === true) {
      if(result.message !== '') msg.channel.send(result.message);
    } else {
      if (result.message === '') {
        msg.channel.send('No error message specified. Somebody messed up or dev bot is active.');
      } else {
        msg.channel.send(result.message);
      }
    }
  });
});

// Bot login
bot.login(config.token);

bot.on("ready", async () => {
  console.log("Ready");
  guild = bot.guilds.cache.get(config.guildId);
  bot.user.setActivity(`over ${bot.users.cache.size} monkeys`, { type: 'WATCHING' })
  setInterval(() => {
    bot.user.setActivity(`over ${bot.users.cache.size} monkeys`, { type: 'WATCHING' })
  }, 60000);
 

  logInChannel("Ready");

  db.collection("bot-commands").onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    // logInChannel(`${changes.length} commands found`);
    changes.forEach((change) => {
      let docData = change.doc.data();
      if (docData.executed === false) {
        console.log("new command found");
        let cmd = docData.command;
        let args = docData.arguments;
        let cmdObj = bot.commands.get(cmd); //gets the command based on its name
        if (cmdObj) {
          if (cmdObj.cmd.type !== "db") return;
          cmdObj.run(bot, null, args, db, guild).then(async (result) => {
            if (result.status) {
              console.log(`Command ${cmd} complete. Updating database`);
              console.log(result.message);
              logInChannel(result.message);
            } else {
              console.log(result.message);
            }
            await db.collection("bot-commands").doc(change.doc.id).update({
              executed: true,
              executedTimestamp: Date.now(),
              status: result.status,
            });
            await db.collection("bot-commands").doc(change.doc.id).delete();
          });
        }
      }
    });
  });
});

function logInChannel(message) {
  if (config.channels.botLog !== null && config.channels.botLog !== undefined) {
    guild.channels.cache
      .find((ch) => ch.id === config.channels.botLog)
      .send(message);
  }
}

const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const secret = config.secret;

// GitHub: X-Hub-Signature
// Gogs:   X-Gogs-Signature
const sigHeaderName = "X-Hub-Signature";

const app = express();
app.use(bodyParser.json());

function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body);
  if (!payload) {
    return next("Request body empty");
  }

  const sig = req.get(sigHeaderName) || "";
  const hmac = crypto.createHmac("sha1", secret);
  const digest = Buffer.from(
    "sha1=" + hmac.update(payload).digest("hex"),
    "utf8"
  );
  const checksum = Buffer.from(sig, "utf8");
  if (
    checksum.length !== digest.length ||
    !crypto.timingSafeEqual(digest, checksum)
  ) {
    return next(
      `Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`
    );
  }
  return next();
}

app.post("/release", verifyPostData, function (req, res) {
  const releasedata = req.body;
  if (releasedata.action == "released") {
    let message = "";
    message += `<@&${config.roles.updatePing}>\n`;
    message += "**monkeytype " + releasedata.release.tag_name + "**";
    message += "```\n";
    message += releasedata.release.body + "\n";
    message += "```";

    if (message.length > 2000) {
      guild.channels.cache
      .find((ch) => ch.id === config.channels.botLog)
      .send(`Yo stoopid <@102819690287489024>. That update log was too long for me to send.`);
    } else {
      guild.channels.cache
      .find((ch) => ch.id === config.channels.updates)
      .send(message);
    }    
  }
  res.status(200).send("Request body was signed");
});

app.use((err, req, res, next) => {
  if (err) console.error(err);
  res.status(403).send("Request body was not signed or verification failed");
});

app.listen(3000);
