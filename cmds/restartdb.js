module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  const { exec } = require("child_process");

  try {
    
    let questionMessage = await message.channel.send(":question: Are you sure?");
    await questionMessage.react("✅");
    await questionMessage.react("❌");
    showtimeout = true;

    const filter = (reaction, user) =>
      (reaction.emoji.name === "✅" ||
        reaction.emoji.name === "❌" ||
        reaction.emoji.name === "🔨") &&
      user.id === message.author.id;

    let collector = questionMessage.createReactionCollector(filter, {
      max: 2,
      time: 10000,
    });

    collector.on("end", async (r) => {
      questionMessage.reactions.removeAll();
      if (showtimeout) {
        questionMessageContent[0] = `:x: Reaction timeout`;
        questionMessage.edit(questionMessageContent.join(""));
        return;
      }
    });

    collector.on("collect", async (r) => {
      questionMessage.reactions.removeAll();

      if (r.emoji.name === "✅") {
        showtimeout = false;
        questionMessage.edit(":thinking: Sending restart command...");
        try {
          exec("systemctl restart mongod", (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            if (stderr) {
              throw stderr;
            }
            questionMessage.edit(":white_check_mark: Restart command sent.");
            // stdout
          });
        } catch (e) {
          console.error(e);
          questionMessage.edit(
            ":x: Something went wrong while sending the command: " + e
          );
        }
      } else if (r.emoji.name === "❌") {
        showtimeout = false;
        collector.stop();
        questionMessage.edit(":x: Canceled");
      }
    });
  } catch (e) {
    return {
      status: false,
      message: ":x: Something went wrong: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "restartdb",
  needMod: true,
};
