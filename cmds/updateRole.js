module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  if (args.length !== 2) {
    return {
      status: false,
      message: ":x: Must provide two arguments",
    };
  }

  const config = require("../config.json");
  let discordId = args[0];
  let wpm = args[1];
  let correctRole = null;

  await fillRoleCache();

  let member = await guild.members.cache.find(
    (member) => member.user.id == discordId
  );

  try {
    let minWpm = await findCurrent(config.wpmRoles, member);

    if (minWpm < wpm) {
      await removeAllRoles(config.wpmRoles, member);
      return member.roles
        .add(correctRole)
        .then((ret) => {
          return {
            status: true,
            message: `:white_check_mark: Assigned role ${correctRole.name} to user <@${member.user.id}> (${wpm} wpm)`,
          };
        })
        .catch((e) => {
          return {
            status: false,
            message: e,
          };
        });
    } else {
      return {
        status: true,
        message: `:warning: Higher role found for user <@${member.user.id}> (requested ${wpm}, but ${minWpm} role was found)`,
      };
    }
  } catch (e) {
    return {
      status: false,
      message: ":x: Error: Could not find member - " + e,
    };
  }

  async function fillRoleCache() {
    console.log("filling role cache");
    config.wpmRoles.forEach((role) => {
      role.cache = guild.roles.cache.find(
        (cacheRole) => role.id === cacheRole.id
      );
      if (wpm >= role.min && wpm <= role.max) {
        correctRole = role.cache;
      }
    });
    console.log("complete");
  }
};

async function findCurrent(wpmRoles, member) {
  console.log("finding current role");
  let ret = 0;
  wpmRoles.forEach((role) => {
    if (member.roles.cache.has(role.id)) ret = role.max;
  });
  console.log("complete");
  return ret;
}

async function removeAllRoles(wpmRoles, member) {
  console.log("removing all roles");
  wpmRoles.forEach((role) => {
    member.roles.remove(role.id);
  });
  console.log("complete");
}

module.exports.cmd = {
  name: "updateRole",
  type: "db",
};
