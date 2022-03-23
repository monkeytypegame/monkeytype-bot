const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit("../monkeytype");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  let statusmsg;
  try {
    await git.fetch("upstream", "master");
    statusmsg = await message.channel.send(`:thinking: Fetching...`);
    await git.checkout("master");
    await statusmsg.edit(`:thinking: Switching to master...`);
    await git.mergeFromTo("upstream/master", "master");
    await statusmsg.edit(`:thinking: Merging...`);
    await git.push("origin", "master");
    await statusmsg.edit(`:thinking: Pushing...`);
    await statusmsg.delete();
    return {
      status: true,
      message: ":white_check_mark: Synchronised...",
    };
  } catch (e) {
    statusmsg.delete();
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
