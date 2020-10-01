module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  try {
    let role = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === args.join(' ').toLowerCase()
    );

    if (role === undefined) {
      return {
        status: true,
        message: ":x: Could not find role " + args.join(' '),
      };
    }

    let rolecount = role.members.size;
    let membersstring = rolecount === 1 ? "member" : "members";

    return {
      status: true,
      message: `:white_check_mark: I found ${rolecount} ${membersstring} with the role '${args.join(' ')}'`,
    };
  } catch (e) {
    return {
      status: true,
      message: "Something went wrong when running command: " + e,
    };
  }
};

module.exports.cmd = {
  name: "inrole",
  needMod: false,
  onlyBotCommandsChannel: true,
};
