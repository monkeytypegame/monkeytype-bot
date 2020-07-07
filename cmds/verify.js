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
                return {
                  status: true,
                  message:
                    "Verified! Refresh the website to make sure that your accounts are paired. You should see a message 'Your accounts are paired' in the settings page.",
                };
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
    if (config.logChannel !== null && config.logChannel !== undefined) {
      guild.channels.cache
        .find((ch) => ch.id === config.logChannel)
        .send(message);
    }
  }
};

module.exports.cmd = {
  name: "verify",
  type: "dm",
};
