module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  if (args.length !== 2) {
    return {
      status: false,
      message: ":x: Must provide two arguments",
    };
  }

  const config = require("../config.json");
  let discordId = args[0];
  let wpm = Math.round(args[1]);
  let correctRole = null;

  await fillRoleCache();

  let member = await guild.members.cache.find(
    (member) => member.user.id == discordId
  );

  if(!member){
    return {
      status: false,
      message: `:x: Could not update role for <@${args[0]}>. Member not found in cache.`,
    };
  }

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
    config.wpmRoles.forEach((role) => {
      role.cache = guild.roles.cache.find(
        (cacheRole) => role.id === cacheRole.id
      );
      if (wpm >= role.min && wpm <= role.max) {
        correctRole = role.cache;
      }
    });
  }
};

async function findCurrent(wpmRoles, member) {
  let ret = 0;
  wpmRoles.forEach((role) => {
    if (member.roles.cache.has(role.id)) ret = role.max;
  });
  return ret;
}

async function removeAllRoles(wpmRoles, member) {
  wpmRoles.forEach((role) => {
    member.roles.remove(role.id);
  });
}

module.exports.cmd = {
  name: "updateRole",
  type: "db",
};
