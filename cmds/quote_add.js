const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit('../../monkeytype');

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);
  
  
    try {
      
        let messageContent = await message.channel.messages.fetch(args[0]);
        messageContent = messageContent.content;

        console.log(messageContent);


      return {
        status: true,
        message: ":white_check_mark: Synchronised..."
      }
    } catch (e) {
      return {
        status: false,
        message: ":x: Could not add quote: " + e.message,
      };
    }
  };
  
  module.exports.cmd = {
    name: "quote_add",
    needMod: true,
  };
  