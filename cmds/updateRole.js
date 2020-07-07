module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  if (args.length !== 2) {
    return {
      status: false,
      message: "Error: Must provide two arguments",
    };
  }

  const config = require("../config.json");
  let discordId = args[0];
  let wpm = args[1];
  let correctRole = null;

  config.wpmRoles.forEach((role) => {
    role.cache = guild.roles.cache.find(
      (cacheRole) => role.id === cacheRole.id
    );
    if (wpm >= role.min && wpm <= role.max) {
      correctRole = role.cache;
    }
  });

  let member = await guild.members.cache.find(
    (member) => member.user.id == discordId
  );

  try {
    config.wpmRoles.forEach((wpmRole) => {
      if (wpmRole.id !== correctRole.id) {
        member.roles.remove(wpmRole.cache);
      }
    });
    return member.roles
      .add(correctRole)
      .then((ret) => {
        return {
          status: true,
          message: `Assigned role ${correctRole.name} to user <@${member.user.id}>`,
        };
      })
      .catch((e) => {
        return {
          status: false,
          message: e,
        };
      });
  } catch (e) {
    return {
      status: false,
      message: "Error: Could not find member - " + e,
    };
  }
};

module.exports.cmd = {
  name: "updateRole",
  type: "db",
};
