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

  let memberRole = guild.roles.cache.find(
    (role) => role.id === config.roles.memberRole
  );
  // let pairingCode = String(args[0]);

  // let usersQuery = await db
  //   .collection("users")
  //   .where("discordPairingCode", "==", pairingCode)
  //   .get();
  // let userDocs = usersQuery.docs;

  // if (userDocs.length === 0) {
  //   logInChannel(
  //     `Could not find pairing code for <@${message.author.id}> - pairing code ${pairingCode}`
  //   );
  //   return {
  //     status: false,
  //     message: "Could not find that pairing code",
  //   };
  // } else if (userDocs.length > 1) {
  //   logInChannel(
  //     `Multiple users with the same pairing code!!! <@Miodec> ${pairingCode} <@${message.author.id}>`
  //   );
  //   return {
  //     status: false,
  //     message: "Something went wrong! Please contact Miodec.",
  //   };
  // } else if (userDocs.length === 1) {
    // let userData = userDocs[0].data();

    // if (userData.discordId != undefined) {
    //   return {
    //     status: false,
    //     message: "Account is already paired.",
    //   };
    // }

    //start pairing
    // return db
    //   .collection("users")
    //   .doc(userDocs[0].id)
    //   .update({
    //     discordId: message.author.id,
    //     discordPairingCode: null
    //   })
    //   .then((ret) => {
        return guild.members.cache
          .find((member) => member.user.id == args[0])
          .roles.add(memberRole)
          .then(async (d) => {
            logInChannel(
              `<@${args[0]}> just verified their account.`
            );
            guild.channels.cache
            .find((ch) => ch.id === config.channels.botCommands)
            .send(`<@${args[0]}>, your account is verified. If you have a 60s personal best, you will get a role soon.`);
            let userData = await db.collection('users').doc(args[1]).get();
            userData = userData.data();
            let pbs;
            try {
              pbs = userData.personalBests.time[60];
            } catch (e) {
              return {
                status: true,
                message:
                  `Verified <@${args[0]}>, but no time 60 pb found.`,
              };
            }
            if (pbs === undefined) {
              return {
                status: true,
                message:
                `Verified <@${args[0]}>, but no time 60 pb found.`,
              };
            }
            try {
              let bestwpm = -1;
              pbs.forEach((pb) => {
                if (pb.wpm > bestwpm) bestwpm = pb.wpm;
              });
              if (bestwpm > -1) {
                return db
                  .collection("bot-commands")
                  .add({
                    command: "updateRole",
                    arguments: [args[0], bestwpm],
                    executed: false,
                    requestTimestamp: Date.now(),
                  })
                  .then((f) => {
                    return {
                      status: true,
                      message: `Verified <@${args[0]}> and updated role`,
                    };
                  })
                  .catch((e) => {
                    return {
                      status: true,
                      message: `Verified <@${args[0]}>. Error while finding t60 pb ${e.message}`,
                    };
                  });
              }
            } catch (e) {
              return {
                status: true,
                message: `Verified <@${args[0]}>. Error while finding t60 pb ${e.message}`,
              };
            }
          })
          .catch((e) => {
            logInChannel(
              `Could not update role for <@${args[0]}> - ${e}`
            );
            return {
              status: false,
              message: `Could not update role for <@${args[0]}> - ${e}`
            };
          });
      // })
      // .catch((e) => {
      //   logInChannel(
      //     `Could not pair account for <@${message.author.id}> - ${e}`
      //   );
      //   return {
      //     status: false,
      //     message: "Could not pair to your account: " + e,
      //   };
      // });
  // }

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
