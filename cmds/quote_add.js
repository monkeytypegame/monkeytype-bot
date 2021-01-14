const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit('../monkeytype');
const beautify = require("json-beautify");

module.exports.run = async (bot, message, args, db, guild) => {
    console.log(`Running command ${this.cmd.name}`);
  
  
    try {
      
        let messageContent = await message.channel.messages.fetch(args[0]);
        messageContent = messageContent.content.split('\n');

        messageContent[2] = messageContent[2].toLowerCase();

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
        };
        messageContent[0] = messageContent[0].replace(/[“”’‘—,…«»–]/g, (char) => specials[char] || "");
        
        let newQuote = {
          text: messageContent[0],
          source: messageContent[1],
          length: messageContent[0].length
        }

        let questionMessageContent = [
          `:question: I'm about to add this quote to the **${messageContent[2]}** file. Is this correct?`,
          `\`\`\`json\n${JSON.stringify(newQuote,null,2)}\`\`\``
        ]

        let questionMessage = await message.channel.send(questionMessageContent.join(''));
        await questionMessage.react("✅");
        
        const filter = (reaction, user) =>
            reaction.emoji.name === "✅" && user.id === message.author.id;

        let collector = questionMessage.createReactionCollector(filter, {
            max: 1,
            time: 60000
        })
        
        collector.on('collect', async r => {
          questionMessage.reactions.removeAll();
          const fileDir = `../monkeytype/static/quotes/${messageContent[2]}.json`;

          let returnMessage = "";

          questionMessageContent[0] = `:thinking: Looking for ${messageContent[2]}.json...`;
          questionMessage.edit(questionMessageContent.join(''));
          
          try{
            if (fs.existsSync(fileDir)) {
                questionMessageContent[0] = `:thinking: File exists. Adding quote...`;
                questionMessage.edit(questionMessageContent.join(''));
                let quoteFile = fs.readFileSync(fileDir);
                quoteFile = JSON.parse(quoteFile.toString());
                let newid = Math.max.apply(Math, quoteFile.quotes.map(function(q) { return q.id; })) + 1;
                newQuote.id = newid;
                quoteFile.quotes.push(newQuote);
                fs.writeFileSync(fileDir,JSON.stringify(quoteFile));
                returnMessage = `Added quote to ${messageContent[2]}.json.`;
            } else {
                //file doesnt exist, create it
                questionMessageContent[0] = `:thinking: File not found. Creating...`;
                questionMessage.edit(questionMessageContent.join(''));
                newQuote.id = 1;
                fs.writeFileSync(fileDir, JSON.stringify({
                    "language": messageContent[2],
                    "groups": [
                        [0, 100],
                        [101, 300],
                        [301, 600],
                        [601, 9999]
                    ],
                    "quotes": [newQuote]
                })
                );
                returnMessage = `Created file ${messageContent[2]}.json and added quote.`
            }

            questionMessageContent[0] = `:thinking: Pulling latest changes from upstream...`;
            questionMessage.edit(questionMessageContent.join(''));
            await git.pull('upstream','master');
            questionMessageContent[0] = `:thinking: Staging ${messageContent[2]}.json...`;
            questionMessage.edit(questionMessageContent.join(''));
            await git.add([`static/quotes/${messageContent[2]}.json`]);
            questionMessageContent[0] = `:thinking: Committing...`;
            questionMessage.edit(questionMessageContent.join(''));
            await git.commit(`Added quote to ${messageContent[2]}.json`);
            questionMessageContent[0] = `:thinking: Pushing to origin...`;
            questionMessage.edit(questionMessageContent.join(''));
            await git.push('origin','master');

            questionMessageContent[0] = `:white_check_mark: ${returnMessage}`;
            questionMessage.edit(questionMessageContent.join(''));
            collector.stop();

          }catch(e){
            console.error(e);
            questionMessage.edit(':x: Something went wrong while editing the file: ' + e);
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
  