module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  try {

    await require("child_process").spawn("/home/ubuntu/monkey-bot/restart.sh", [], {
      detached: true
    })
    return {
      status: true,
      message: "Restarting..."
    }
  } catch (e) {
    return {
      status: false,
      message: "Could not restart: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "restart",
  needMod: true,
};
