const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit('../../monkeytype');

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);
  
  
    try {
      git.fetch('upstream','master');
      message.channel.send(
        `:thinking: Fetching...`
      );
      git.checkout('master');
      message.channel.send(
        `:thinking: Switching to master...`
      );
      git.merge('upstream','master');
      message.channel.send(
        `:thinking: Merging...`
      );
      return {
        status: true,
        message: ":white_check_mark: Synchronised..."
      }
    } catch (e) {
      return {
        status: false,
        message: ":x: Could not sync: " + e.message,
      };
    }
  };
  
  module.exports.cmd = {
    name: "quote_sync",
    needMod: true,
  };
  