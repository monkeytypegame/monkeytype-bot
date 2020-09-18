module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const { exec } = require("child_process");

  try {
    message.channel.send(`Upgrading...`);
    exec("~/monkey-bot/upgrade.sh", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
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
