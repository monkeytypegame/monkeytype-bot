const { connectDB, mongoDB } = require("../mongodb.js");

module.exports.run = async (bot, message, args, guild) => {
  await connectDB();
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  if (args.length !== 1) {
    return {
      status: false,
      message: ":x: Must provide one argument",
    };
  }

  let statusmsg;


  const config = require("../config.json");

  const targetUser = message.mentions.users.first();
  // const targetUserName = `${targetUser.username}#${targetUser.discriminator}`;
  const discordId = targetUser.id;

  statusmsg = await message.channel.send(`:thinking: Accessing database...`);
  let doc = await mongoDB().collection("users").findOne({ discordId })
  if (!doc) {
    await statusmsg.delete();
    return {
      status: false,
      message: `:x: Fix wpm role: Could not find user. Make sure your accounts are paired.`,
    };
  }

  await statusmsg.edit(`:thinking: Checking personal bests...`);

  let pbObj = doc.personalBests;

  let time60s = pbObj?.time?.[60];

  if(time60s == undefined || time60s.length == 0){
    await statusmsg.delete();
    return {
      status: false,
      message: `:x: Fix wpm role: No time 60 results found.`,
    };
  }

  let wpm = 0;
  time60s.forEach(pb => {
    if(pb.wpm > wpm) wpm = pb.wpm;
  })
  wpm = Math.round(wpm);

  await statusmsg.edit(`:thinking: Checking personal bests... Got it...`);

  let correctRole = null;

  await statusmsg.edit(`:thinking: Filling role cache...`);

  await fillRoleCache();

  let member = await guild.members.cache.find(
    (member) => member.user.id == discordId
  );

  try {
    await statusmsg.edit(`:thinking: Removing all other speed roles...`);
      await removeAllRoles(config.wpmRoles, member);
      await statusmsg.edit(`:thinking: Adding member role...`);
      await member.roles.add(config.roles.memberRole);
      await statusmsg.edit(`:thinking: Adding speed role...`);
      return member.roles
        .add(correctRole)
        .then(async (ret) => {
          await statusmsg.delete();
          return {
            status: true,
            message: `:white_check_mark: Fix wpm role: Assigned role ${correctRole.name} to user <@${discordId}>`,
          };
        })
        .catch(async (e) => {
          await statusmsg.delete();
          return {
            status: false,
            message: ":x: Something went wrong",
          };
        });
  } catch (e) {
    await statusmsg.delete();
    return {
      status: false,
      message: ":x: Something went wrong",
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

async function removeAllRoles(wpmRoles, member) {
  wpmRoles.forEach((role) => {
    member.roles.remove(role.id);
  });
}

module.exports.cmd = {
  name: "fixwpmrole",
  needMod: true,
};
