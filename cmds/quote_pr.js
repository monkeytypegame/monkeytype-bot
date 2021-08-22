const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit("../monkeytype");

module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  const fetch = require("node-fetch");

  let msg;
  try {
    msg = await message.channel.send(":thinking: Sending to GitHub...");
    return fetch("https://api.github.com/repos/miodec/monkeytype/pulls", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${config.githubApiToken}`,
        accept: "application/vnd.github.v3+json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        title: "Added more quotes",
        head: "monkeytypegeorge:master",
        base: "master",
        maintainer_can_modify: true,
      }),
    })
      .then(async (response) => {
        let data = await response.json();
        if (response.status === 201 && response.statusText == "Created") {
          msg.delete();
          return {
            status: true,
            message: ":white_check_mark: Done: " + data.html_url,
          };
        } else {
          msg.delete();
          return {
            status: false,
            message: "Something went wrong. Code " + response.status,
          };
        }
      })
      .catch((e) => {
        return {
          status: false,
          message: "Something went wrong. " + e,
        };
      });
  } catch (e) {
    msg.delete();
    return {
      status: false,
      message: ":x: Could not push quotes: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "quote_pr",
  needMod: true,
};
