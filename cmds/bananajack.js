const Discord = require("discord.js");

let suits = ["♥", "♣", "♦", "♠"];
let values = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

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
        message: `:x: Can't bananajack for ${bananaBet} bananas. Example: !bananajack 1`,
      };
    } else {
      if (isNaN(bananaBet)) {
        return {
          status: false,
          message: `:x: Can't bananajack for ${bananaBet} bananas. Example: !bananajack 1`,
        };
      }
      if (bananaBet < 1) {
        return {
          status: false,
          message: `:x: Can't bananajack for ${bananaBet} bananas. Example: !bananajack 1`,
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
                ":x: It seems like you already have an ongoing bananajack game.",
            };
          }

          function createDeck() {
            //creating the deck
            let deck = [];
            //suitIndex will range up from 0 to 3 because there are 4suits in the deck and valueIndex will range up from 0 to 12 because there are 13values in the deck.
            //we are going to loop through all the suits and for each suit, we are going to loop through all their values and call deck.push, our value of suit.Hence we just created a full deck of 52cards.
            for (let suitIndex = 0; suitIndex < suits.length; suitIndex++) {
              for (
                let valueIndex = 0;
                valueIndex < values.length;
                valueIndex++
              ) {
                let card = {
                  //creating card object with a suit property and value property
                  suit: suits[suitIndex],
                  value: values[valueIndex],
                };
                deck.push(card); //and we want to push the card onto the deck
              }
            }
            return deck;
          }

          function shuffleDeck(deck) {
            for (let i = 0; i < deck.length; i++) {
              //create a for loop and loop through every card in the deck.
              let swapIndex = Math.trunc(Math.random() * deck.length); //calculate and index of a card we can swap with eg. card #1 and swap with any random card within the 52 cards between [0] and [51] then remove decimals with trunc
              let tmp = deck[swapIndex];
              deck[swapIndex] = deck[i];
              deck[i] = tmp;
              //swap deck subscript i with deck subscript swapIndex so will temporarily hold onto deck swapIndex and then deck swapIndex will set that to deck i and then will set deck i to our tmp variable hence we are swapping deck i with deck swapIndex hence shuffling the entire deck.
            }
          }

          function getCardNumericValue(card) {
            //but if the card.value is 10, Jack, Queen or King it return 10 thus default block will be executed.
            switch (card.value) {
              case "A":
                return 1;
              case "2":
                return 2;
              case "3":
                return 3;
              case "4":
                return 4;
              case "5":
                return 5;
              case "6":
                return 6;
              case "7":
                return 7;
              case "8":
                return 8;
              case "9":
                return 9;
              default:
                return 10;
            }
          }

          function getNextCard() {
            //get the next card off the top of the deck
            return deck.shift(); //take the 1st value of the deck and shift down the other values in the array.
          }

          function getScore(cardArray) {
            //we are passing an array of cards in the getscore function.
            let score = 0; //initialize score to zero.
            let hasAce = false; //important to know if the player has an Ace/not for if yes, she adds 10more points to the score. An Ace is usually 1 or 11points.
            for (let i = 0; i < cardArray.length; i++) {
              //loop through all the cards as long as i is less than cardArray.length  will execute the block of code till ...true
              let card = cardArray[i]; //will take cardArray i and then assign it to card then call getCardNumericValue and pass it the card and get back a new value of that card and add that to score.
              score += getCardNumericValue(card); //score will increment as each card is read.
              if (card.value === "A") {
                //and if the card.value is an Ace then hasAce equals true.
                hasAce = true;
              }
            }
            if (hasAce && score + 10 <= 21) {
              //both hasAce and score have to meet the criteria.
              return score + 10;
            }
            return score; // returning score thus getting the score out of this function.
          }

          function updateScores() {
            dealerScore = getScore(dealerCards); //setting dealerScore to a function called getScore and passing dealerCards to it.
            playerScore = getScore(playerCards);
          }

          function getCardString(card) {
            //storing your card as an object thus easily access the suit and its value
            //return card.value + " of " + card.suit;
            return card.suit + " " + card.value;
          }

          function checkForEndOfGame() {
            updateScores(); // call update scores to check if scores are current

            if (gameOver) {
              //if game is over we want to give the dealer the option of taking cards
              //let dealer take cards
              while (
                dealerScore < playerScore && //while the dealerscore is less than playerscore meaning dealer is loosing and pscore is less than/equal to 21 and dscore is less than/equal to 21 ; we want to give the dealer a new card and update scores as well.
                playerScore <= 21 &&
                dealerScore <= 21
              ) {
                dealerCards.push(getNextCard());
                updateScores();
              }
            }

            if (playerScore > 21) {
              //if pscore is greater than 21 then the player lost and game is over else if the dscore is greater than 21 then the player won and game over.
              playerWon = false;
              gameOver = true;
            } else if (dealerScore > 21) {
              playerWon = true;
              gameOver = true;
            } else if (playerScore === 21) {
              playerWon = true;
              gameOver = true;
            } else if (gameOver) {
              //else if game is over we want to determine who won and if pscore is greater than dscore then player won else false.

              if (playerScore > dealerScore) {
                playerWon = true;
              } else if (playerScore === dealerScore) {
                tied = true;
              } else {
                playerWon = false;
              }
            }
          }

          let gameOver = false,
            playerWon = false,
            tied = false;
          (dealerCards = []), (playerCards = []), (dealerScore = 0);
          playerScore = 0;
          deck = [];

          currentlyPlaying.set(message.author.id, true);

          deck = createDeck(); // created deck and added a new function call after this called shuffleDeck passing in the deck.
          shuffleDeck(deck); //ref below defined shuffleDeck(deck) function
          dealerCards = [getNextCard(), getNextCard()]; //both dealer and player start off with 2cards each.
          playerCards = [getNextCard(), getNextCard()];

          let dealerCardString = " ";
          for (let i = 0; i < dealerCards.length; i++) {
            dealerCardString += "``" + getCardString(dealerCards[i]) + "`` ";
          }

          let playerCardString = " ";
          for (let i = 0; i < playerCards.length; i++) {
            playerCardString += "``" + getCardString(playerCards[i]) + "`` ";
          }

          message.channel
            .send({
              embed: {
                author: {
                  name: `${message.member.displayName}'s bananajack game`,
                },
                thumbnail: {
                  url: "https://i.ibb.co/2k7vbYx/bananajack.png",
                },
                color: 15589385,
                fields: [
                  {
                    name: `${message.member.displayName}`,
                    value:
                      "Cards - " +
                      playerCardString +
                      "\n Total - ``" +
                      getScore(playerCards) +
                      "``",
                    inline: true,
                  },
                  {
                    name: "George",
                    value:
                      "Cards - " +
                      dealerCardString +
                      "\n Total - ``" +
                      getScore(dealerCards) +
                      "``",
                    inline: true,
                  },
                ],
                footer: {
                  text:
                    "K, Q, J = 10  |  A = 1 or 11\nH - Hit | S - Stand\nwww.monkeytype.com",
                },
              },
            })
            .then((msg) => {
              msg.react("🇭").then((r) => {
                msg.react("🇸");
                const standFilter = (reaction, user) =>
                  reaction.emoji.name === "🇸" && user.id === message.author.id;
                const hitFilter = (reaction, user) =>
                  reaction.emoji.name === "🇭" && user.id === message.author.id;
                const stand = msg.createReactionCollector(standFilter, {
                  time: 60000,
                });

                const hit = msg.createReactionCollector(hitFilter, {
                  time: 60000,
                });

                const removeReaction = (msg, message, emoji) => {
                  try {
                    msg.reactions.cache
                      .find((r) => r.emoji.name == emoji)
                      .users.remove(message.author);
                  } catch (err) {
                    console.log("err: ", err);
                  }
                };

                async function showStatus() {
                  let dealerCardString = " ";
                  for (let i = 0; i < dealerCards.length; i++) {
                    dealerCardString +=
                      "``" + getCardString(dealerCards[i]) + "`` ";
                  }

                  let playerCardString = " ";
                  for (let i = 0; i < playerCards.length; i++) {
                    playerCardString +=
                      "``" + getCardString(playerCards[i]) + "`` ";
                  }

                  updateScores();

                  if (gameOver) {
                    if (tied) {
                      bananaData = JSON.parse(await fs.readFile("bananas.json"));
                      if (
                        bananaData[message.author.id].bananajackTies ===
                        undefined
                      ) {
                        bananaData[message.author.id].bananajackTies = 1;
                      } else {
                        bananaData[message.author.id].bananajackTies++;
                      }

                      await fs.writeFile(
                        "bananas.json",
                        JSON.stringify(bananaData)
                      );

                      console.log("tied! nobody wins!");
                      msg.edit({
                        embed: {
                          description:
                            "**Tied!**\nNobody wins! Your bananas is returned.",
                          author: {
                            name: `${message.member.displayName}'s bananajack game`,
                          },
                          thumbnail: {
                            url: "https://i.ibb.co/2k7vbYx/bananajack.png",
                          },
                          color: 16620865,
                          fields: [
                            {
                              name: `${message.member.displayName}`,
                              value:
                                "Cards - " +
                                playerCardString +
                                "\n Total - ``" +
                                getScore(playerCards) +
                                "``",
                              inline: true,
                            },
                            {
                              name: "George",
                              value:
                                "Cards - " +
                                dealerCardString +
                                "\n Total - ``" +
                                getScore(dealerCards) +
                                "``",
                              inline: true,
                            },
                          ],
                          footer: {
                            text:
                              "K, Q, J = 10  |  A = 1 or 11\nH - Hit | S - Stand\nwww.monkeytype.com",
                          },
                        },
                      });
                      hit.stop();
                      stand.stop();
                      currentlyPlaying.delete(message.author.id);
                      return {
                        status: true,
                        message: ``,
                      };
                    }

                    if (playerWon) {
                      bananaData = JSON.parse(await fs.readFile("bananas.json"));
                      bananaData[message.author.id].balance += bananaBet;
                      if (
                        bananaData[message.author.id].bananajackWins ===
                        undefined
                      ) {
                        bananaData[message.author.id].bananajackWins = 1;
                      } else {
                        bananaData[message.author.id].bananajackWins++;
                      }

                      await fs.writeFile(
                        "bananas.json",
                        JSON.stringify(bananaData)
                      );

                      console.log("player win");
                      msg.edit({
                        embed: {
                          description: `**You win! The monkey busted!**\nYou won **${bananaBet}** bananas. You now have **${
                            bananaData[message.author.id].balance
                          }**.`,
                          author: {
                            name: `${message.member.displayName}'s bananajack game`,
                          },
                          thumbnail: {
                            url: "https://i.ibb.co/2k7vbYx/bananajack.png",
                          },
                          color: 4324703,
                          fields: [
                            {
                              name: `${message.member.displayName}`,
                              value:
                                "Cards - " +
                                playerCardString +
                                "\n Total - ``" +
                                getScore(playerCards) +
                                "``",
                              inline: true,
                            },
                            {
                              name: "George",
                              value:
                                "Cards - " +
                                dealerCardString +
                                "\n Total - ``" +
                                getScore(dealerCards) +
                                "``",
                              inline: true,
                            },
                          ],
                          footer: {
                            text:
                              "K, Q, J = 10  |  A = 1 or 11\nH - Hit | S - Stand\nwww.monkeytype.com",
                          },
                        },
                      });
                      hit.stop();
                      stand.stop();
                      currentlyPlaying.delete(message.author.id);
                      return {
                        status: true,
                        message: ``,
                      };
                    } else {
                      bananaData = JSON.parse(await fs.readFile("bananas.json"));
                      bananaData[message.author.id].balance -= bananaBet;
                      bananaData[bot.user.id].balance += bananaBet;
                      if (
                        bananaData[message.author.id].bananajackLosses ===
                        undefined
                      ) {
                        bananaData[message.author.id].bananajackLosses = 1;
                      } else {
                        bananaData[message.author.id].bananajackLosses++;
                      }

                      await fs.writeFile(
                        "bananas.json",
                        JSON.stringify(bananaData)
                      );

                      console.log("dealer wins");
                      msg.edit({
                        embed: {
                          description: `**You lose! Busted!** You lost **${bananaBet}** bananas. You now have **${
                            bananaData[message.author.id].balance
                          }**.`,
                          author: {
                            name: `${message.member.displayName}'s bananajack game`,
                          },
                          thumbnail: {
                            url: "https://i.ibb.co/2k7vbYx/bananajack.png",
                          },
                          color: 16597313,
                          fields: [
                            {
                              name: `${message.member.displayName}`,
                              value:
                                "Cards - " +
                                playerCardString +
                                "\n Total - ``" +
                                getScore(playerCards) +
                                "``",
                              inline: true,
                            },
                            {
                              name: "George",
                              value:
                                "Cards - " +
                                dealerCardString +
                                "\n Total - ``" +
                                getScore(dealerCards) +
                                "``",
                              inline: true,
                            },
                          ],
                          footer: {
                            text:
                              "K, Q, J = 10  |  A = 1 or 11\nH - Hit | S - Stand\nwww.monkeytype.com",
                          },
                        },
                      });
                      hit.stop();
                      stand.stop();
                      currentlyPlaying.delete(message.author.id);
                      return {
                        status: true,
                        message: ``,
                      };
                    }
                  } else {
                    msg.edit({
                      embed: {
                        author: {
                          name: `${message.member.displayName}'s bananajack game`,
                        },
                        thumbnail: {
                          url: "https://i.ibb.co/2k7vbYx/bananajack.png",
                        },
                        color: 15589385,
                        fields: [
                          {
                            name: `${message.member.displayName}`,
                            value:
                              "Cards - " +
                              playerCardString +
                              "\n Total - ``" +
                              getScore(playerCards) +
                              "``",
                            inline: true,
                          },
                          {
                            name: "George",
                            value:
                              "Cards - " +
                              dealerCardString +
                              "\n Total - ``" +
                              getScore(dealerCards) +
                              "``",
                            inline: true,
                          },
                        ],
                        footer: {
                          text:
                            "K, Q, J = 10  |  A = 1 or 11\nH - Hit | S - Stand\nwww.monkeytype.com",
                        },
                      },
                    });
                  }
                }

                stand.on("collect", (r) => {
                  gameOver = true;
                  checkForEndOfGame();
                  showStatus();
                  removeReaction(msg, message, "🇸");
                });

                hit.on("collect", (r) => {
                  playerCards.push(getNextCard());
                  checkForEndOfGame();
                  showStatus();
                  removeReaction(msg, message, "🇭");
                });

                hit.on("end", (r) => {
                  if (gameOver === false) {
                    gameOver = true;
                    checkForEndOfGame();
                    showStatus();
                    console.log("bananajack game ended. afk?");
                  }
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
  name: "bananajack",
  needMod: false,
  requiredChannel: "banana",
};
