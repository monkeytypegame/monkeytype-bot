module.exports.run = async (bot, message, args, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const issueName = args.join(" ");
  const config = require("../config.json");
  const fetch = require("node-fetch");

  try {
    message.channel.send("Sending to GitHub...");

    return fetch("https://api.github.com/repos/miodec/monkeytype/issues", {
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
        title: issueName,
        labels: ["bug"],
      }), // body data type must match "Content-Type" header
    }).then(async (response) => {
      let data = await response.json();
      if (response.status === 201 && response.statusText == "Created") {
        return {
          status: true,
          message: "Done: " + data.html_url,
        };
      } else {
        return {
          status: false,
          message: "Something went wrong. Code " + response.status,
        };
      }
    });
  } catch (e) {
    return {
      status: false,
      message: "Could not create issue: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "bug",
  needMod: true,
};
