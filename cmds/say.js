module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let chname = args.shift();
  try {
    guild.channels.cache.find((ch) => ch.name === chname).send(args.join(" "));
    return {
      status: true,
      message: "Done",
    };
  } catch (e) {
    return {
      status: false,
      message: "Can't find channel",
    };
  }
};

module.exports.cmd = {
  name: "say",
};
