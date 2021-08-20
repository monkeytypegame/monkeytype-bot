const Discord = require("discord.js");

const currentlyPlaying = new Discord.Collection();

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const bananaBet = Math.round(args[0]);
  const fs = require("fs").promises;
  let bananaData;
  try {
    bananaData = JSON.parse(await fs.readFile("bananas.json"));
  } catch (e) {
    return {
      status: true,
      message: ":x: No users found",
    };
  }
  try {
    if (isNaN(bananaBet)) {
      return {
        status: false,
        message: `:x: Can't play rock paper scissors for ${bananaBet} bananas. Example: !rps 1`,
      };
    } else {
      if (isNaN(bananaBet)) {
        return {
          status: false,
          message: `:x: Can't play rock paper scissors for ${bananaBet} bananas. Example: !rps 1`,
        };
      }
      if (bananaBet < 1) {
        return {
          status: false,
          message: `:x: Can't play rock paper scissors for ${bananaBet} bananas. Example: !rps 1`,
        };
      }

      userData = bananaData[message.author.id];
      if (userData === undefined || userData.balance === 0) {
        return {
          status: true,
          message: ":x: You have no bananas",
        };
      } else {
        if (bananaBet > userData.balance) {
          return {
            status: true,
            message: ":x: You don't have enough bananas.",
          };
        } else {
          if (currentlyPlaying.has(message.author.id)) {
            return {
              status: true,
              message:
                ":x: It seems like you already have an ongoing rock paper scissors game.",
            };
          }

          var computerChoice;
          var playerChoice;

          function computerGamble() {
            var dice = Math.random();
            if (dice <= 1 / 3) {
              computerChoice = "Rock";
            } else if (dice > 1 / 3 && dice <= 2 / 3) {
              computerChoice = "Paper";
            } else {
              computerChoice = "Scissors";
            }
          }

          function getEmoji(gesture) {
            switch (gesture) {
              case "Scissors":
                return "✌️";
              case "Rock":
                return "✊";
              case "Paper":
                return "✋";
              default:
                return "error";
            }
          }

          // start playing
          currentlyPlaying.set(message.author.id, true);

          message.channel
            .send({
              embed: {
                author: {
                  name: `${message.member.displayName}'s Rock Paper Scissors`,
                },
                thumbnail: {
                  url: "https://static.thenounproject.com/png/477919-200.png",
                },
                color: 15589385,
                fields: [
                  {
                    name: `${message.member.displayName}`,
                    value: "Pick your gesture.",
                    inline: true,
                  },
                  {
                    name: "George",
                    value: ":grey_question:",
                    inline: true,
                  },
                ],
                footer: {
                  text: "Rock, Paper, Scissors\nwww.monkeytype.com",
                },
              },
            })
            .then((msg) => {
              msg.react("✌️").then((r) => {
                msg.react("✋").then((r) => {
                  msg.react("✊");
                  const scissorsFilter = (reaction, user) =>
                    reaction.emoji.name === "✌️" &&
                    user.id === message.author.id;
                  const paperFilter = (reaction, user) =>
                    reaction.emoji.name === "✋" &&
                    user.id === message.author.id;
                  const rockFilter = (reaction, user) =>
                    reaction.emoji.name === "✊" &&
                    user.id === message.author.id;

                  const scissors = msg.createReactionCollector(scissorsFilter, {
                    time: 60000,
                  });

                  const paper = msg.createReactionCollector(paperFilter, {
                    time: 60000,
                  });

                  const rock = msg.createReactionCollector(rockFilter, {
                    time: 60000,
                  });

                  async function tie() {
                    bananaData = JSON.parse(await fs.readFile("bananas.json"));
                    bananaData[message.author.id].balance =
                      bananaData[message.author.id].balance;
                    if (bananaData[message.author.id].rpsTies === undefined) {
                      bananaData[message.author.id].rpsTies = 1;
                    } else {
                      bananaData[message.author.id].rpsTies++;
                    }

                    await fs.writeFile(
                      "bananas.json",
                      JSON.stringify(bananaData)
                    );

                    msg.edit({
                      embed: {
                        description:
                          "**Tied!**\nNobody wins! Your bananas is returned.",
                        author: {
                          name: `${message.member.displayName}'s Rock Paper Scissors`,
                        },
                        thumbnail: {
                          url:
                            "https://static.thenounproject.com/png/477919-200.png",
                        },
                        color: 16620865,
                        fields: [
                          {
                            name: `${message.member.displayName}`,
                            value: getEmoji(playerChoice),
                            inline: true,
                          },
                          {
                            name: "George",
                            value: getEmoji(computerChoice),
                            inline: true,
                          },
                        ],
                        footer: {
                          text: "Rock, Paper, Scissors\nwww.monkeytype.com",
                        },
                      },
                    });
                    paper.stop();
                    scissors.stop();
                    rock.stop();
                    currentlyPlaying.delete(message.author.id);
                    return {
                      status: true,
                      message: ``,
                    };
                  }

                  async function victory() {
                    bananaData = JSON.parse(await fs.readFile("bananas.json"));
                    bananaData[message.author.id].balance += bananaBet;
                    if (bananaData[message.author.id].rpsWins === undefined) {
                      bananaData[message.author.id].rpsWins = 1;
                    } else {
                      bananaData[message.author.id].rpsWins++;
                    }

                    await fs.writeFile(
                      "bananas.json",
                      JSON.stringify(bananaData)
                    );

                    msg.edit({
                      embed: {
                        description: `**You win! The monkey busted!**\nYou won **${bananaBet}** bananas. You now have **${
                          bananaData[message.author.id].balance
                        }**.`,
                        author: {
                          name: `${message.member.displayName}'s Rock Paper Scissors`,
                        },
                        thumbnail: {
                          url:
                            "https://static.thenounproject.com/png/477919-200.png",
                        },
                        color: 4324703,
                        fields: [
                          {
                            name: `${message.member.displayName}`,
                            value: getEmoji(playerChoice),
                            inline: true,
                          },
                          {
                            name: "George",
                            value: getEmoji(computerChoice),
                            inline: true,
                          },
                        ],
                        footer: {
                          text: "Rock, Paper, Scissors\nwww.monkeytype.com",
                        },
                      },
                    });
                    paper.stop();
                    scissors.stop();
                    rock.stop();
                    currentlyPlaying.delete(message.author.id);
                    return {
                      status: true,
                      message: ``,
                    };
                  }

                  async function defeat() {
                    bananaData = JSON.parse(await fs.readFile("bananas.json"));
                    bananaData[message.author.id].balance -= bananaBet;
                    bananaData[bot.user.id.toString()].balance += bananaBet;
                    if (bananaData[message.author.id].rpsLosses === undefined) {
                      bananaData[message.author.id].rpsLosses = 1;
                    } else {
                      bananaData[message.author.id].rpsLosses++;
                    }

                    await fs.writeFile(
                      "bananas.json",
                      JSON.stringify(bananaData)
                    );

                    msg.edit({
                      embed: {
                        description: `**You lose! Busted!** You lost **${bananaBet}** bananas. You now have **${
                          bananaData[message.author.id].balance
                        }**.`,
                        author: {
                          name: `${message.member.displayName}'s Rock Paper Scissors`,
                        },
                        thumbnail: {
                          url:
                            "https://static.thenounproject.com/png/477919-200.png",
                        },
                        color: 16597313,
                        fields: [
                          {
                            name: `${message.member.displayName}`,
                            value: getEmoji(playerChoice),
                            inline: true,
                          },
                          {
                            name: "George",
                            value: getEmoji(computerChoice),
                            inline: true,
                          },
                        ],
                        footer: {
                          text: "Rock, Paper, Scissors\nwww.monkeytype.com",
                        },
                      },
                    });
                    paper.stop();
                    scissors.stop();
                    rock.stop();
                    currentlyPlaying.delete(message.author.id);
                    return {
                      status: true,
                      message: ``,
                    };
                  }

                  function afk() {
                    msg.edit({
                      embed: {
                        description:
                          "**Timeout!** User was unable to react within 60 seconds.",
                        author: {
                          name: `${message.member.displayName}'s Rock Paper Scissors`,
                        },
                        thumbnail: {
                          url:
                            "https://static.thenounproject.com/png/477919-200.png",
                        },
                        color: 16597313,
                        fields: [
                          {
                            name: `${message.member.displayName}`,
                            value: `:x:`,
                            inline: true,
                          },
                          {
                            name: "George",
                            value: getEmoji(computerChoice),
                            inline: true,
                          },
                        ],
                        footer: {
                          text: "Rock, Paper, Scissors\nwww.monkeytype.com",
                        },
                      },
                    });
                    paper.stop();
                    scissors.stop();
                    rock.stop();
                    currentlyPlaying.delete(message.author.id);
                    return {
                      status: true,
                      message: ``,
                    };
                  }

                  function compare() {
                    if (playerChoice == computerChoice) {
                      tie();
                    } else if (
                      playerChoice === "Rock" &&
                      computerChoice === "Paper"
                    ) {
                      defeat();
                    } else if (
                      playerChoice === "Rock" &&
                      computerChoice === "Scissors"
                    ) {
                      victory();
                    } else if (
                      playerChoice === "Paper" &&
                      computerChoice === "Rock"
                    ) {
                      victory();
                    } else if (
                      playerChoice === "Paper" &&
                      computerChoice === "Scissors"
                    ) {
                      defeat();
                    } else if (
                      playerChoice === "Scissors" &&
                      computerChoice === "Paper"
                    ) {
                      victory();
                    } else if (
                      playerChoice === "Scissors" &&
                      computerChoice === "Rock"
                    ) {
                      defeat();
                    }
                  }

                  scissors.on("collect", (r) => {
                    computerGamble();
                    playerChoice = "Scissors";
                    compare();
                  });

                  paper.on("collect", (r) => {
                    computerGamble();
                    playerChoice = "Paper";
                    compare();
                  });

                  rock.on("collect", (r) => {
                    computerGamble();
                    playerChoice = "Rock";
                    compare();
                  });

                  scissors.on("end", (r) => {
                    if (playerChoice === undefined) {
                      computerGamble();
                      afk();
                    }
                  });
                });
              });
            });
        }
      }
    }
  } catch (e) {
    return {
      status: false,
      message: "Something went very wrong: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "rps",
  needMod: false,
  requiredChannel: "banana",
};
