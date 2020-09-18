module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  try {





    setTimeout(() => {

      require("child_process").spawn("~/monkey-bot/restart.sh", [], {
        detached: true
      })

    },1000);
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
