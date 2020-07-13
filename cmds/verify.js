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

  return db
    .collection("users")
    .get()
    .then((ret) => {
      let found = false;
      let discordInUse = false;
      let foundId = "";
      ret.docs.forEach((doc) => {
        let userData = doc.data();
        if (userData.discordPairingCode === undefined) return;
        if (String(userData.discordPairingCode) === String(pairingCode)) {
          found = true;
          foundId = doc.id;
        }
        if (userData.discordId == message.author.id) {
          discordInUse = true;
        }
      });
      if (discordInUse) {
        return {
          status: false,
          message:
            "This Discord account is already paired with another monkey-type account.",
        };
      }
      if (found) {
        return db
          .collection("users")
          .doc(foundId)
          .update({ discordId: message.author.id })
          .then((ret) => {
            return guild.members.cache
              .find((member) => member.user.id == message.author.id)
              .roles.add(memberRole)
              .then((d) => {
                logInChannel(
                  `<@${message.author.id}> just verified their account.`
                );
                return db
                  .collection("users")
                  .doc(foundId)
                  .get()
                  .then((pbsdoc) => {
                    let pbs;
                    try {
                      pbs = pbsdoc.data().personalBests.time[60];
                    } catch (e) {
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
                    return {
                      status: true,
                      message: `Verified, but something went wrong when trying to check your previous time 60 personal bests (${e.message})! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.`,
                    };
                  });
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
      } else {
        logInChannel(
          `Could not find pairing code for <@${message.author.id}> - pairing code ${pairingCode}`
        );
        return {
          status: false,
          message: "Could not find that pairing code",
        };
      }
    })
    .catch((e) => {
      logInChannel(`Could not get user list <@${message.author.id}> - ${e}`);
      return {
        status: false,
        message: "Could not get user list: " + e,
      };
    });

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
