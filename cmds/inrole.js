module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");

    if (!first.length && !second.length) return 1; // if both are empty strings
    if (!first.length || !second.length) return 0; // if only one is empty string
    if (first === second) return 1; // identical
    if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
    if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

      firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  }

  function findBestMatch(mainString, targetStrings) {
    if (!areArgsValid(mainString, targetStrings)) {
      return {
        status: true,
        message: `:x: Bad arguments: First argument should be a string, second should be an array of strings. Should not happen, contact <@450147582740791307>.`,
      }; // should not happen because I've made a check whether first argument exists or not. if it does, discord should(?) automatically detect them as a string.
    }

    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = compareTwoStrings(mainString, currentTargetString);
      ratings.push({
        target: currentTargetString,
        rating: currentRating,
      });
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }

    const bestMatch = ratings[bestMatchIndex];

    return {
      ratings,
      bestMatch,
      bestMatchIndex,
    };
  }

  function areArgsValid(mainString, targetStrings) {
    if (typeof mainString !== "string") return false;
    if (!Array.isArray(targetStrings)) return false;
    if (!targetStrings.length) return false;
    if (targetStrings.find((s) => typeof s !== "string")) return false;
    return true;
  }

  function removeA(arr) {
    var what,
      a = arguments,
      L = a.length,
      ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax = arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  }

  if (!args[0]) {
    return {
      status: true,
      message: `:x: Please specify a role name.`,
    };
  }

  let roleList = [];

  guild.roles.cache.forEach(function (role) {
    roleList.push(role.name);
  });

  removeA(roleList, "@everyone");

  try {
    let match = findBestMatch(args.join(" "), roleList);
    let bestMatch = match.bestMatch.target;

    //console.log(match.ratings);
    //console.log(match.bestMatch);
    //console.log(match.bestMatchIndex); ------ debugging!

    if (match.bestMatch.rating == 0) {
      return {
        status: true,
        message: `:x: Could not find role " + args.join(' ') + ", best match accuracy returned 0.00%.`,
      };
    }

    var bestMatchVerify = false;

    let role = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === bestMatch.toLowerCase()
    );

    if (role === undefined) {
      return {
        status: true,
        message: `:x: Could not find role " + args.join(' ') + ", best match returned accuracy is " + match.bestMatch.rating + ".`,
      };
    } // shouldn't happen, but just for precaution.

    if (args.join(" ") == bestMatch) {
      bestMatchVerify = true;
    }

    let rolecount = role.members.size;
    let membersstring = rolecount === 1 ? "member" : "members";

    if (bestMatchVerify) {
      message.channel.send(
        `:white_check_mark: I found ${rolecount} ${membersstring} with the role '${args.join(
          " "
        )}`
      );
    } else {
      message.channel.send(
        `:grey_question: Did you mean: ${bestMatch}? (${
          ((match.bestMatch.rating / 1) * 100).toFixed(2) + "%"
        } accurate). I found ${rolecount} ${membersstring} with the role '${bestMatch}'`
      );
    }
    if (rolecount > 0) {
      const members = message.guild.members.cache
        .filter((member) => member.roles.cache.find((res) => res == role))
        .map((member) => member.user.tag);
      let membersLength = members.length;
      let limit_per_page = 5;
      let totalPages = Math.ceil(membersLength / limit_per_page);

      if (rolecount <= limit_per_page) {
        message.channel.send({
          embed: {
            color: 1699677,
            description: `${members.join("\n")}`,
            footer: {
              text: "Page 1 of 1 \nwww.monkeytype.com",
            },
            thumbnail: {
              url: message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 256,
              }),
            },
            author: {
              name: `Full list of people with the role: ${bestMatch}`,
            },
          },
        });
        return {
          status: true,
          message: ``,
        };
      } else {
        let pages = [];
        let page = 1;

        var prevCombinedStrings = "";
        var currentDetailsIndex = 0;

        for (pageLoop = 0; pageLoop < totalPages; pageLoop++) {
          for (i = 0; i < limit_per_page; i++) {
            // console.log(members[currentDetailsIndex]) --- debugging!!

            if (i == limit_per_page - 1) {
              prevCombinedStrings =
                prevCombinedStrings + members[currentDetailsIndex];
              pages.push(prevCombinedStrings);
              prevCombinedStrings = "";
              currentDetailsIndex += 1;
            } else {
              prevCombinedStrings =
                prevCombinedStrings + members[currentDetailsIndex] + "\n";
              currentDetailsIndex += 1;
            }
          }
        }

        // checking for undefined: (should work either way even if undefined doesn't exist
        var str = pages[pages.length - 1];
        str = str.split("\nundefined").join("");
        pages[pages.length - 1] = str;

        message.channel
          .send({
            embed: {
              color: 1699677,
              description: `${pages[0]}`,
              footer: {
                text: `Page ${page} of ${pages.length} \nwww.monkeytype.com`,
              },
              thumbnail: {
                url: message.guild.iconURL({
                  format: "png",
                  dynamic: true,
                  size: 256,
                }),
              },
              author: {
                name: `Full list of people with the role: ${bestMatch}`,
              },
            },
          })
          .then((msg) => {
            msg.react("⬅️").then((r) => {
              msg.react("➡️");

              const backwardsFilter = (reaction, user) =>
                reaction.emoji.name === "⬅️" && user.id === message.author.id;
              const forwardsFilter = (reaction, user) =>
                reaction.emoji.name === "➡️" && user.id === message.author.id;

              const backwards = msg.createReactionCollector(backwardsFilter, {
                time: 60000,
              });

              const forwards = msg.createReactionCollector(forwardsFilter, {
                time: 60000,
              });

              const removeReaction = (msg, message, emoji) => {
                try {
                  msg.reactions.cache
                    .find((r) => r.emoji.name == emoji)
                    .users.remove(message.author);
                } catch (err) {
                  console.log("err: ", err);
                  message.channel.send("err: ", err);
                }
              };

              backwards.on("collect", (r) => {
                removeReaction(msg, message, "⬅️");
                if (page === 1) return;
                page--;

                msg.edit({
                  embed: {
                    color: 1699677,
                    description: `${pages[page - 1]}`,
                    footer: {
                      text: `Page ${page} of ${pages.length} \nwww.monkeytype.com`,
                    },
                    thumbnail: {
                      url: message.guild.iconURL({
                        format: "png",
                        dynamic: true,
                        size: 256,
                      }),
                    },
                    author: {
                      name: `Full list of people with the role: ${bestMatch}`,
                    },
                  },
                });
              });

              forwards.on("collect", (r) => {
                removeReaction(msg, message, "➡️");
                if (page === pages.length) return;
                page++;

                msg.edit({
                  embed: {
                    color: 1699677,
                    description: `${pages[page - 1]}`,
                    footer: {
                      text: `Page ${page} of ${pages.length} \nwww.monkeytype.com`,
                    },
                    thumbnail: {
                      url: message.guild.iconURL({
                        format: "png",
                        dynamic: true,
                        size: 256,
                      }),
                    },
                    author: {
                      name: `Full list of people with the role: ${bestMatch}`,
                    },
                  },
                });
              });
            });
          });

        return {
          status: true,
          message: ``,
        };
      }
    }
  } catch (e) {
    return {
      status: true,
      message: "Something went wrong when running command: " + e,
    };
  }
};

module.exports.cmd = {
  name: "inrole",
  needMod: false,
  requiredChannel: "botCommands",
};
