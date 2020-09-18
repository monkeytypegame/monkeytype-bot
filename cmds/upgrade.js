module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const { exec } = require("child_process");

  try {
    require("child_process").spawn("/home/ubuntu/monkey-bot/upgrade.sh", [], {
      detached: true
    })
    return {
      status: true,
      message: "Upgrading..."
    }
  } catch (e) {
    return {
      status: false,
      message: "Could not upgrade: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "upgrade",
  needMod: true,
};
