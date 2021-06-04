const axiosInstance = require("../axiosInstance");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  if (config.noLog) {
    return {
      status: false,
      message: "",
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

    return guild.members.cache
      .find((member) => member.user.id == args[0])
      .roles.add(memberRole)
      .then(async (d) => {
        // logInChannel(`<@${args[0]}> just verified their account.`);
        guild.channels.cache
          .find((ch) => ch.id === config.channels.botCommands)
          .send(
            `:white_check_mark: <@${args[0]}>, your account is verified. If you have a 60s personal best, you will get a role soon.`
          );
        let userData = await axiosInstance.get(`/getUserPbsByUid/${args[1]}`)
        userData = userData.data;
        let pbs;
        try {
          pbs = userData.personalBests.time[60];
        } catch (e) {
          return {
            status: true,
            message: `:white_check_mark: Verified <@${args[0]}>, but no time 60 pb found.`,
          };
        }
        if (pbs === undefined) {
          return {
            status: true,
            message: `:white_check_mark: Verified <@${args[0]}>, but no time 60 pb found.`,
          };
        }
        try {
          let bestwpm = -1;
          pbs.forEach((pb) => {
            if (pb.wpm > bestwpm) bestwpm = pb.wpm;
          });
          if (bestwpm > -1) {
            await axiosInstance.post("/newBotCommand", {
              command: "updateRole",
              arguments: [args[0], bestwpm],
              executed: false,
              requestTimestamp: Date.now(),
            }).then((f) => {
              return {
                status: true,
                message: `:white_check_mark: Verified <@${args[0]}> and updated role`,
              };
            })
            .catch((e) => {
              return {
                status: true,
                message: `:warning: Verified <@${args[0]}>. Error while finding t60 pb ${e.message}`,
              };
            });
          }
        } catch (e) {
          return {
            status: true,
            message: `:warning: Verified <@${args[0]}>. Error while finding t60 pb ${e.message}`,
          };
        }
      })
      .catch((e) => {
        logInChannel(`:x: Could not update role for <@${args[0]}> - ${e}`);
        return {
          status: false,
          message: `:x: Could not update role for <@${args[0]}> <@102819690287489024>  - ${e}`,
        };
      });
  } catch (e) {
    return {
      status: false,
      message: `:x: Verification for <@${args[0]}> failed!!! <@102819690287489024> - ${e}`,
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

module.exports.cmd = {
  name: "verify",
  type: "db",
};
