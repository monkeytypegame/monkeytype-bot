// require packages
const Discord = require("discord.js");
const fs = require("fs");
// require( 'console-stamp' )( console );
var async = require("async");

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });


const { connectDB, mongoDB } = require("./mongodb.js");

// initialise are bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// import bot setting
let prefix = "!";
const config = require("./config.json");

// initialise firebase
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
  if (Date.now() - lastReact >= 1500) {
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

  if (config.dev === true && msg.author.id !== "102819690287489024") return;

  if (
    msg.member.roles.cache.some(
      (role) =>
        role.id === config.roles.adminRole || role.id === config.roles.modRole
    ) &&
    msg.content.toLowerCase() === "ping"
  ) {
    msg.channel.send("pong");
    return;
  }

  if (msg.mentions.has(bot.user)) {
    if (/(shut *up|stfu|sh+|bad)/g.test(msg.content.toLowerCase())) {
      if (Math.round(Math.random()) === 1) {
        msg.channel.send(":(");
      } else {
        msg.channel.send("<:hmph:736029217380237363>");
      }
    }
    if (/(good|nice|thanks|good job|thank you|ty)/g.test(msg.content.toLowerCase())) {
      msg.channel.send(":)");
    }
    return;
  }

  if (
    /(how.*role.*\?)|(how.*challenge.*\?)|(wpm role.*\?)|(pair.*account.*\?)/g.test(
      msg.content.toLocaleLowerCase()
    )
  ) {
    msg.channel.send(
      `:question: Hey <@${msg.author.id}>, checkout the <#741305227637948509> channel. 
      \nIf you are looking for more help related to getting wpm role check this out https://docs.google.com/presentation/d/1KY0V0mCYcRNRMUSdxmjmZLNemKsjeA8fT1tLzTDfGRg/edit?usp=sharing`
    );
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

  if (cmdObj.cmd.disabled) {
    msg.channel.send(":x: Command temporarily disabled.");
    return;
  }

  if (!shouldBotReact()) {
    msg.channel.send(":x: Please wait a bit before using a commmand");
    return;
  }
  if (!config.dev) {
    if (
      cmdObj.cmd.requiredChannel &&
      msg.channel.id !== config.channels[cmdObj.cmd.requiredChannel]
    ) {
      msg.channel.send(
        `:x: Please use the <#${
          config.channels[cmdObj.cmd.requiredChannel]
        }> channel.`
      );
      setTimeout(() => {
        msg.delete();
      }, 500);
      return;
    }
  }

  if (cmdObj.cmd.type === "dm" || cmdObj.cmd.type === "db") {
    msg.channel.send(`:x: Command ${cmd} cannot be executed manually`);
    setTimeout(() => {
      msg.delete();
    }, 500);
    return;
  }

  cmdObj.run(bot, msg, args, guild).then((result) => {
    console.log(result);
    if (result.status === true) {
      if (result.message !== "") msg.channel.send(result.message);
    } else {
      if (result.message === "") {
        msg.channel.send(
          ":x: No error message specified. Somebody messed up or dev bot is active."
        );
      } else {
        msg.channel.send(result.message);
      }
    }
  });
});

bot.on("messageDelete", async (message) => {
  // ignore direct messages
  if (!message.guild) return;
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: "MESSAGE_DELETE",
  });
  // Since we only have 1 audit log entry in this collection, we can simply grab the first one
  const deletionLog = fetchedLogs.entries.first();

  // Let's perform a coherence check here and make sure we got *something*
  // if (!deletionLog) {
  logInChannel(
    `:wastebasket: <@${message.author.id}>'s message in <#${message.channel.id}> was deleted:\n${message.content}`
  );
  return;
  // }

  // We now grab the user object of the person who deleted the message
  // Let us also grab the target of this action to double check things
  const { executor, target } = deletionLog;

  // And now we can update our output with a bit more information
  // We will also run a check to make sure the log we got was for the same author's message
  if (target.id === message.author.id && target.lastMessage.id === message.id) {
    logInChannel(
      `:wastebasket: <@${message.author.id}>'s message was deleted by <@${executor.id}>:\n${message.content}`
    );
    return;
  } else {
    logInChannel(
      `:wastebasket: <@${message.author.id}> deleted their own message:\n${message.content}`
    );
    return;
  }
});

// Bot login
bot.login(config.token);

var commandsQueue = async.queue(async function (task, callback) {
  try{
    console.log(`queue length: ${commandsQueue.length()}`);
  } catch {} 

  let result = await task.cmdObj.run(bot, null, task.args, guild);
  console.log(result);
  if (result.status) {
    console.log(`Command ${task.cmd} complete. Updating database`);
    console.log(result.message);
    logInChannel(result.message);
  } else {
    console.log(result.message);
    logInChannel(result.message);
  }
  await mongoDB().collection("bot-commands").deleteOne({ _id: task.commandId});

  callback();
  
});

bot.on("ready", async () => {
  console.log("Ready");
  guild = bot.guilds.cache.get(config.guildId);
  await guild.fetch();
  bot.user.setActivity(`over ${guild.approximatePresenceCount} monkeys`, {
    type: "WATCHING",
  });
  setInterval(async () => {
    guild = bot.guilds.cache.get(config.guildId);
    await guild.fetch();
    bot.user.setActivity(`over ${guild.approximatePresenceCount} monkeys`, {
      type: "WATCHING",
    });
  }, 3600000);

  logInChannel(":smile: Ready");

  await connectDB();

  console.log('db connected');

  
  setInterval( async () => {

    checkCommands();

  }, 30000);



  // }, 10000);



  


  // botCommandsStream = mongoDB().collection("bot-commands").watch();
  // botCommandsStream.on('change', async (doc) => {
      // let docData = doc.fullDocument;
      // if (docData.executed === false) {
      //   console.log("new command found");
      //   let cmd = docData.command;
      //   let args = docData.arguments;
      //   let cmdObj = bot.commands.get(cmd); //gets the command based on its name
      //   if (cmdObj) {
      //     if (cmdObj.cmd.type !== "db"){
      //       callback();
      //       return;
      //     }
      //     cmdObj.run(bot, null, args, db, guild).then(async (result) => {
      //       if (result.status) {
      //         console.log(`Command ${cmd} complete. Updating database`);
      //         console.log(result.message);
      //         logInChannel(result.message);
      //       } else {
      //         console.log(result.message);
      //       }
      //       //why is the command updated and then deleted?
      //       await mongoDB().collection("bot-commands").updateOne({ _id: docData._id}, {
      //         executed: true,
      //         executedTimestamp: Date.now(),
      //         status: result.status,
      //       });
      //       await mongoDB().collection("bot-commands").deleteOne({ _id: docData._id});
      //       callback();
      //     });
      //   }else{
      //     callback();
      //   }
      // }else{
      //   callback();
      // }
  // });
});

async function checkCommands(){
    
  const array = await mongoDB().collection("bot-commands").find({executed: false}).limit(10).toArray();

  console.log(`Checking DB for commands. Found ${array.length}`);

  array.forEach(async command => {
    if (command.executed === false){
      let cmd = command.command;
      let args = command.arguments;
      let cmdObj = bot.commands.get(cmd);
      if (cmdObj) {
        if (cmdObj.cmd.type !== "db"){
          // callback();
          return;
        }
        await mongoDB().collection("bot-commands").updateOne({ _id: command._id}, {$set: {executed: true}});
        commandsQueue.push({cmd, cmdObj, args, commandId: command._id});
        // callback();
      }else{
        // callback();
      }
    }else{
      // callback();
    }
  })
}

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
        .send(
          `:flushed: Yo stoopid <@102819690287489024>. That update log was too long for me to send.`
        );
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
