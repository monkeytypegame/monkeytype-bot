/** @format */

const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit("../monkeytype");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  let statusmsg;
  try {
    await git.fetch("upstream", "dev");
    statusmsg = await message.channel.send(`:thinking: Fetching...`);
    await git.checkout("dev");
    await statusmsg.edit(`:thinking: Switching to dev...`);
    await git.mergeFromTo("upstream/dev", "dev");
    await statusmsg.edit(`:thinking: Merging...`);
    await git.push("origin", "dev");
    await statusmsg.edit(`:thinking: Pushing...`);
    await statusmsg.delete();
    return {
      status: true,
      message: ":white_check_mark: Synchronised..."
    };
  } catch (e) {
    statusmsg.delete();
    return {
      status: false,
      message: ":x: Could not sync: " + e.message
    };
  }
};

module.exports.cmd = {
  name: "quote_sync",
  needMod: true
};
