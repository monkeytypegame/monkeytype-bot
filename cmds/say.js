module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  let chname = args.shift();
  try {
    guild.channels.cache.find((ch) => ch.name === chname).send(args.join(" "));
    return {
      status: true,
      message: ":speech_balloon: Done",
    };
  } catch (e) {
    return {
      status: false,
      message: ":x: Can't find channel",
    };
  }
};

module.exports.cmd = {
  name: "say",
  needMod: true,
};
