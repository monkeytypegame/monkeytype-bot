module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  const { spawn } = require('child_process');

  try {
    let subprocess = spawn("/home/ubuntu/monkey-bot/restart.sh", [], {
      detached: true,
      stdio: 'ignore'
    })
    subprocess.unref();
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
