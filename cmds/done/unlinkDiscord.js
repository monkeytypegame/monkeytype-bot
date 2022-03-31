const { connectDB, mongoDB } = require("../../mongodb.js");

module.exports.run = async (bot, message, args, guild) => {
  await connectDB();
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  if (config.noLog) {
    return {
      status: false,
      message: ""
    };
  }
  // if (args.length === 0) {
  //   return {
  //     status: false,
  //     message: "Error: Please provide your pairing code",
  //   };
  // }

  //args[0] did
  //args[1] uid
  try {
    let memberRole = guild.roles.cache.find(
      (role) => role.id === config.roles.memberRole
    );

    let member = await guild.members.cache.find(
      (member) => member.user.id == args[0]
    );

    if (!member) {
      return {
        status: false,
        message: `:x: Could not unlink <@${args[0]}>. Member not found in cache.`
      };
    }

    return member.roles
      .remove(memberRole)
      .then(async (d) => {
        // logInChannel(`<@${args[0]}> just verified their account.`)
        try {
          await removeAllRoles(config.wpmRoles, member);
          guild.channels.cache
            .find((ch) => ch.id === config.channels.botCommands)
            .send(
              `:white_check_mark: <@${args[0]}>, your account is unlinked.`
            );
          return {
            status: true,
            message: `:warning: Uninked <@${args[0]}>.`
          };
        } catch (e) {
          return {
            status: true,
            message: `:warning: Uninked <@${args[0]}>. Error removing speed roles: ${e.message}`
          };
        }
      })
      .catch((e) => {
        logInChannel(`:x: Could not unlink <@${args[0]}> - ${e}`);
        return {
          status: false,
          message: `:x: Could not unlink <@${args[0]}> <@102819690287489024>  - ${e}`
        };
      });
  } catch (e) {
    return {
      status: false,
      message: `:x: Unlinking <@${args[0]}> failed!!! <@102819690287489024> - ${e}`
    };
  }

  function logInChannel(message) {
    if (
      config.channels.botLog !== null &&
      config.channels.botLog !== undefined
    ) {
      guild.channels.cache
        .find((ch) => ch.id === config.channels.botLog)
        .send(message);
    }
  }
};

async function removeAllRoles(wpmRoles, member) {
  wpmRoles.forEach((role) => {
    member.roles.remove(role.id);
  });
}

module.exports.cmd = {
  name: "unlinkDiscord",
  type: "db"
};
