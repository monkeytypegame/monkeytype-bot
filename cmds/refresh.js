module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  message.channel.send(
    `Make sure you clear your cache! This is should be the first thing you try if something doesn't seem right or after Miodec fixed a bug. All it does it makes sure you get the latest code from the server.\n\nYou can do so by pressing \`CTRL/CMD + SHIFT + R\`.

    `
  );
  return {
    status: true,
    message: "",
  };
};

module.exports.cmd = {
  name: "refresh",
  needMod: true,
};
