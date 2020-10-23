const Discord = require("discord.js")

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);

    //help command try catch statement

    try {
      const helpEmbed = new Discord.MessageEmbed()
      .setColor('#e2b714')
      .setTitle('Monkey Type Help')
      .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 256 }))
      .addFields(
          { name: 'Verification:', value: 'React with ✅ for verification commands help' },
          { name: 'Personal Bests & Statistics:', value: 'React with 📈 for stats commands help' },
          { name: 'Server Info:', value: 'React with ❓ for server info commands help' },
          { name: 'Banana:', value: 'React with 🍌 for banana commands help' }
      )
      .setFooter("www.monkeytype.com");
  var msg = await message.channel.send(helpEmbed);
  
  await msg.react("✅"); //verif
  await msg.react("📈"); //stats
  await msg.react("❓"); //server info
  await msg.react("🍌"); //banana 
  
  const filter = (reaction) => ["✅", "📈", "❓", "🍌"].includes(reaction.emoji.name)
  
  var collected = await msg.awaitReactions(filter, { time: 5000 })
  if (collected.size == 0) return message.reply("You didn't react in time for help!") 
  
  if (collected.find(v => v.emoji.name === "✅")) {
  helpEmbed.fields = [];
    await msg.edit(helpEmbed
      .setTitle('✅ Verification Help')
      .addFields(
      { name: '!verify', value: `1. Login to your monkeytype account\n2. Generate your unique code in the settings page under \`discord integration\`\n3. DM @George !verify <generated code>. __**Please don't send your code in any of the server channels**__\n4. Congrats! Your account is now linked! Your WPM role will generate on the next 60s test you take.` }
      )
  )} else if (collected.find(v => v.emoji.name === "📈")) {
    helpEmbed.fields = [];
    await msg.edit(helpEmbed
        .setTitle('📈 Stats Help')
        .addFields(
          { name: '!pb', value: 'Displays personal bests for worded and timed tests\nYou cannot view other users scores with this command' },
          { name: '!stats', value: 'Displays the number of tests completed and total time typing\nYou cannot view other users score with this command' }
        )
  )} else if (collected.find(v => v.emoji.name === "❓")) {
    helpEmbed.fields = [];
    await msg.edit(helpEmbed
        .setTitle('❓ Server Info Help')
        .addFields(
          { name: '!inrole <role name>', value: 'Displays number of members within the role queried' }
        )
  )}
  else if (collected.find(v => v.emoji.name === "🍌")) {
    helpEmbed.fields = [];
    await msg.edit(helpEmbed
        .setTitle('🍌 Banana Help')
        .addFields(
          { name: '!banana', value: 'Collects 1 banana on use\nOnly can be used once per day - because you know what they say!' },
          { name: '!bananatop', value: 'Displays the biggest potassium hoarders serverwide!' },
          { name: '!bananaflip', value: 'Bet your bananas in a coin flip! Format: !bananaflip <amount> <heads/tails>' },
          { name: '!bananajack', value: 'Bet your bananas in a game of blackjack agaisnt George! Format: !bananajack <amount>' },
          { name: '!rps', value: 'Go against George in a battle of Rock Paper Scissors! Format: !rps <amount>' }
        )
  )} else {
    //do nothing
  }
} catch (error) {
  message.channel.send(`:x: An error has occurred`);
};
};

module.exports.cmd = {
    name: "help",
    needMod: false,
    requiredChannel: "botCommands"
  };
