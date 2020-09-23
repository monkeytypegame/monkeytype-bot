module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  if (args.length === 0) {
    return {
      status: false,
      message: "Error: Please provide your pairing code",
    };
  }

  const config = require("../config.json");

  let memberRole = guild.roles.cache.find(
    (role) => role.id === config.roles.memberRole
  );
  let pairingCode = String(args[0]);

  let usersQuery = await db
    .collection("users")
    .where("discordPairingCode", "==", pairingCode)
    .get();
  let userDocs = usersQuery.docs;

  if (userDocs.length === 0) {
    logInChannel(
      `Could not find pairing code for <@${message.author.id}> - pairing code ${pairingCode}`
    );
    return {
      status: false,
      message: "Could not find that pairing code",
    };
  } else if (userDocs.length > 1) {
    logInChannel(
      `Multiple users with the same pairing code!!! <@Miodec> ${pairingCode} <@${message.author.id}>`
    );
    return {
      status: false,
      message: "Something went wrong! Please contact Miodec.",
    };
  } else if (userDocs.length === 1) {
    let userData = userDocs[0].data();

    if (userData.discordId !== undefined) {
      return {
        status: false,
        message: "Account is already paired.",
      };
    }

    //start pairing
    return db
      .collection("users")
      .doc(userDocs[0].id)
      .update({
        discordId: message.author.id,
        discordPairingCode: null
      })
      .then((ret) => {
        return guild.members.cache
          .find((member) => member.user.id == message.author.id)
          .roles.add(memberRole)
          .then((d) => {
            logInChannel(
              `<@${message.author.id}> just verified their account.`
            );
            let pbs;
            try {
              pbs = userData.personalBests.time[60];
            } catch (e) {
              return {
                status: true,
                message:
                  "Verified, but I couldn't find any previous time 60 personal bests! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.",
              };
            }
            if (pbs === undefined) {
              return {
                status: true,
                message:
                  "Verified, but I couldn't find any previous time 60 personal bests! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.",
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
                    arguments: [message.author.id, bestwpm],
                    executed: false,
                    requestTimestamp: Date.now(),
                  })
                  .then((f) => {
                    return {
                      status: true,
                      message:
                        "Verified, and your WPM role should be updated soon (let us know if its not)! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.",
                    };
                  })
                  .catch((e) => {
                    return {
                      status: true,
                      message: `Verified, but something went wrong when trying to assign your new WPM role (${e.message})! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.`,
                    };
                  });
              }
            } catch (e) {
              return {
                status: true,
                message: `Verified, but something went wrong when trying to check your previous time 60 personal bests (${e.message})! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.`,
              };
            }
          })
          .catch((e) => {
            logInChannel(
              `Could not update role for <@${message.author.id}> - ${e}`
            );
            return {
              status: false,
              message: "Could not update your role: " + e,
            };
          });
      })
      .catch((e) => {
        logInChannel(
          `Could not pair account for <@${message.author.id}> - ${e}`
        );
        return {
          status: false,
          message: "Could not pair to your account: " + e,
        };
      });
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
  type: "dm",
};
