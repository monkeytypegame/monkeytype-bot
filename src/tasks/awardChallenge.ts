import { TaskFile } from "../interfaces/Task";

export default {
  name: "awardChallenge",
  run: async (client, guild, discordUserID: string, challengeName: string) => {
    if (discordUserID === undefined || challengeName === undefined) {
      return {
        status: false,
        message: "Invalid parameters"
      };
    }

    const member = guild.members.cache.get(discordUserID);

    if (member === undefined) {
      return {
        status: false,
        message: "Could not find user"
      };
    }

    const challengeRole = guild.roles.cache.get(
      client.clientOptions.challenges[challengeName] ?? ""
    );

    if (challengeRole === undefined) {
      return {
        status: false,
        message: "Could not find challenge role"
      };
    }

    await member.roles.add(challengeRole);

    const botCommandsChannel = await client.getChannel("botCommands");

    if (botCommandsChannel !== undefined) {
      botCommandsChannel.send(
        `:white_check_mark: Congratulations ${member} for passing the challeng. You have been awarded the ${challengeRole.name} role.`
      );
    }

    return {
      status: true,
      message: "Successfully awarded challenge"
    };
  }
} as TaskFile;

// module.exports.run = async (bot, message, args, guild) => {
//   console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

//   if (args.length !== 2) {
//     return {
//       status: false,
//       message: ":x: Must provide two arguments",
//     };
//   }

//   const config = require("../config.json");
//   let discordId = args[0];
//   let challengeName = args[1];

//   try {
//     let challengeRole = guild.roles.cache.find(
//       (role) => role.id === config.challenges[challengeName]
//     );
  
//     let member = await guild.members.cache.find(
//       (member) => member.user.id == discordId
//     );

//     return member.roles
//       .add(challengeRole)
//       .then((ret) => {
//         guild.channels.cache
//           .find((ch) => ch.id === config.channels.botCommands)
//           .send(
//             `:white_check_mark: Congratulations <@${args[0]}> for passing the challenge. You have been awarded the ${challengeRole.name} role.`
//           );
//         return {
//           status: true,
//           message: `:white_check_mark: Assigned role ${challengeRole.name} to user <@${member.user.id}>`,
//         };
//       })
//       .catch((e) => {
//         return {
//           status: false,
//           message: e,
//         };
//       });
//   } catch (e) {
//     return {
//       status: false,
//       message: ":x: Error: Something went wrong - " + e,
//     };
//   }
// }

// module.exports.cmd = {
//   name: "awardChallenge",
//   type: "db",
// };
