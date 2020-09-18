module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const { exec } = require("child_process");

  try {
    setTimeout(() => {
      exec("~/monkey-bot/restart.sh", (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return {
            status: false,
            message: "Could not restart: " + error.message,
          };
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return {
            status: false,
            message: "Could not restart: " + error.message,
          };
        }
        console.log(`stdout: ${stdout}`);
      });
    },3000);
    return {
      status: true,
      message: "Restarting in 3...2...1.."
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
