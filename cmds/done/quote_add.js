const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit("../monkeytype");
const beautify = require("json-beautify");
const stringSimilarity = require("string-similarity");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);

  try {
    async function forcePush(
      neww,
      quoteFile,
      newQuote,
      questionMessageContent,
      questionMessage,
      language
    ) {
      if (!neww) {
        quoteFile.quotes.push(newQuote);
        fs.writeFileSync(fileDir, JSON.stringify(quoteFile, null, 2));
      }
      originalSuggestionMessage.delete();
      returnMessage = `Added quote to ${language}.json.`;
      // questionMessageContent[0] = `:thinking: Pulling latest changes from upstream...`;
      // questionMessage.edit(questionMessageContent.join(''));
      // await git.pull('upstream', 'master');
      // questionMessageContent[0] = `:thinking: Staging ${language}.json...`;
      // questionMessage.edit(questionMessageContent.join(''));
      // await git.add([`static/quotes/${language}.json`]);
      // questionMessageContent[0] = `:thinking: Committing...`;
      // questionMessage.edit(questionMessageContent.join(''));
      // await git.commit(`Added quote to ${language}.json`);
      // questionMessageContent[0] = `:thinking: Pushing to origin...`;
      // questionMessage.edit(questionMessageContent.join(''));
      // await git.push('origin', 'master');

      questionMessageContent[0] = `:white_check_mark: ${returnMessage}`;
      questionMessageContent.push(`Suggested by ${suggestedBy}`);
      questionMessage.edit(questionMessageContent.join(""));
    }

    let showtimeout = true;
    let language;
    let newQuote;
    let messageContent = await message.channel.messages.fetch(args[0]);
    let originalSuggestionMessage = await message.channel.messages.fetch(
      args[0]
    );
    let suggestedBy = messageContent.author.username;
    let duplicateFound = false;
    try {
      messageContent = JSON.parse(messageContent);
      language = messageContent.language;
      newQuote = {
        text: messageContent.text,
        source: messageContent.source,
        length: messageContent.text.length,
      };
    } catch {
      messageContent = messageContent.content
        .replace(/```\n/g, "")
        .replace(/\n```/g, "")
        .split("\n");
      language = messageContent[2].trim().toLowerCase();
      newQuote = {
        text: messageContent[0].trim(),
        source: messageContent[1].trim(),
        length: messageContent[0].length,
      };
    }

    var specials = {
      "“": '"', // &ldquo;	&#8220;
      "”": '"', // &rdquo;	&#8221;
      "’": "'", // &lsquo;	&#8216;
      "‘": "'", // &rsquo;	&#8217;
      ",": ",", // &sbquo;	&#8218;
      "—": "-", // &mdash;  &#8212;
      "…": "...", // &hellip; &#8230;
      "«": "<<",
      "»": ">>",
      "–": "-",
      "„": '"',
    };
    newQuote.text = newQuote.text.replace(
      /[“”’‘—,…«»–„]/g,
      (char) => specials[char] || ""
    );

    let quoteFile;

    let questionMessageContent = [
      `:question: I'm about to add this quote to the **${language}** file. Is this correct?`,
      `\`\`\`json\n${JSON.stringify(newQuote, null, 2)}\`\`\``,
    ];

    if (/(\\\\t)|(\\\\n)|(\\t)|(\\n)/g.test(newQuote.text)) {
      questionMessageContent.push(
        "Found at least one new line or tab character. This is what the text will look like on the website:"
      );
      let textpreview = newQuote.text
        .replace(/\\\\t/g, "\t")
        .replace(/\\\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\n/g, "\n");
      questionMessageContent.push(`\`\`\`\n${textpreview}\`\`\``);
    }

    const fileDir = `../monkeytype/static/quotes/${language}.json`;

    let questionMessage = await message.channel.send(
      questionMessageContent.join("")
    );
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
      time: 60000,
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

      if (questionMessageContent.length === 4) {
        questionMessageContent.pop();
        questionMessageContent.pop();
      }

      if (r.emoji.name === "✅") {
        showtimeout = false;

        let returnMessage = "";

        questionMessageContent[0] = `:thinking: Looking for ${language}.json...`;
        questionMessage.edit(questionMessageContent.join(""));

        try {
          if (fs.existsSync(fileDir)) {
            questionMessageContent[0] = `:thinking: File exists. Adding quote...`;
            questionMessage.edit(questionMessageContent.join(""));
            quoteFile = fs.readFileSync(fileDir);
            quoteFile = JSON.parse(quoteFile.toString());
            let newid =
              Math.max.apply(
                Math,
                quoteFile.quotes.map(function (q) {
                  return q.id;
                })
              ) + 1;
            newQuote.id = newid;

            //check for similarity
            let highestsimilarity = 0;
            let highestquote;
            quoteFile.quotes.forEach((quote) => {
              let sim = stringSimilarity.compareTwoStrings(
                newQuote.text,
                quote.text
              );
              if (sim > highestsimilarity) {
                highestsimilarity = sim;
                highestquote = quote;
              }
            });

            if (highestsimilarity >= 0.5) {
              duplicateFound = true;
              questionMessageContent[0] = `:grimacing: Found a similar quote (${highestsimilarity}). React with 🔨 to add anyway.`;
              questionMessage.edit(
                questionMessageContent.join("") +
                  "Similar quote:" +
                  `\`\`\`json\n${JSON.stringify(highestquote, null, 2)}\`\`\``
              );
              await questionMessage.react("🔨");
              await questionMessage.react("❌");
              showtimeout = true;
              return;
            } else {
              await forcePush(
                false,
                quoteFile,
                newQuote,
                questionMessageContent,
                questionMessage,
                language
              );
            }
          } else {
            //file doesnt exist, create it
            questionMessageContent[0] = `:thinking: File not found. Creating...`;
            questionMessage.edit(questionMessageContent.join(""));
            newQuote.id = 1;
            fs.writeFileSync(
              fileDir,
              JSON.stringify(
                {
                  language: language,
                  groups: [
                    [0, 100],
                    [101, 300],
                    [301, 600],
                    [601, 9999],
                  ],
                  quotes: [newQuote],
                },
                null,
                2
              )
            );
            returnMessage = `Created file ${language}.json and added quote.`;
            await forcePush(
              true,
              quoteFile,
              newQuote,
              questionMessageContent,
              questionMessage,
              language
            );
          }
        } catch (e) {
          console.error(e);
          questionMessage.edit(
            ":x: Something went wrong while editing the file: " + e
          );
        }
      } else if (r.emoji.name === "❌") {
        showtimeout = false;
        collector.stop();
        if (duplicateFound) {
          questionMessageContent[0] = `:x: Duplicate`;
          originalSuggestionMessage.delete();
        } else {
          questionMessageContent[0] = `:x: Canceled`;
        }
        questionMessageContent.push(`Suggested by ${suggestedBy}`);
        questionMessage.edit(questionMessageContent.join(""));
      } else if (r.emoji.name === "🔨") {
        showtimeout = false;
        collector.stop();
        forcePush(
          false,
          quoteFile,
          newQuote,
          questionMessageContent,
          questionMessage,
          language
        );
      }
    });
  } catch (e) {
    console.error(e);
    return {
      status: false,
      message: ":x: Could not add quote: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "quote_add",
  needMod: true,
};
