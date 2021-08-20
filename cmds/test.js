module.exports.run = async (bot, message, args) => {
  console.log(`Running command ${this.cmd.name}`);
  // message.channel.send("test");
  return {
    status: true,
    message: "Done",
  };
};

module.exports.cmd = {
  name: "test",
  needMod: true,
};
