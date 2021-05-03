module.exports.run = async (bot, message, args, db, guild) => {
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
  let doc = await db
  .collection("users")
  .where("discordId", "==", discordId)
  .get();
  doc = doc.docs;
  if (doc.length === 0) {
    await statusmsg.edit(`:x: Could not find user. Make sure your accounts are paired.`);
    return {
      status: false,
      message: `:x: Fix wpm role: Could not find user. Make sure your accounts are paired.`,
    };
  }else if (doc.length > 1){
    await statusmsg.edit(`:x: More than one accounts are paired to this user.`);
    return {
      status: false,
      message: `:x: Fix wpm role: More than one accounts are paired to this user.`,
    };
  }

  await statusmsg.edit(`:thinking: Checking personal bests...`);
  doc = doc[0].data();

  let pbObj = doc.personalBests;

  let time60s = pbObj?.time?.[60];

  if(time60s == undefined || time60s.length == 0){
    await statusmsg.edit(`:x: No time 60 results found.`);
    return {
      status: false,
      message: `:x: Fix wpm role: No time 60 results found.`,
    };
  }

  let wpm = 0;
  time60s.forEach(pb => {
    if(pb.wpm > wpm) wpm = pb.wpm;
  })

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
          await statusmsg.edit(`:white_check_mark: Done. Assigned role ${correctRole.name}`);
          return {
            status: true,
            message: `:white_check_mark: Fix wpm role: Assigned role ${correctRole.name} to user <@${discordId}>`,
          };
        })
        .catch(async (e) => {
          await statusmsg.edit(`:x: Something went wrong. ` + e);
          return {
            status: false,
            message: e,
          };
        });
  } catch (e) {
    await statusmsg.edit(`:x: Something went wrong. ` + e);
    return {
      status: false,
      message: ":x: Fix wpm role: Error: " + e,
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
