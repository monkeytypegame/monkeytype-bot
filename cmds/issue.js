module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const issueName = args[0];
  const issueBody = args[0] == undefined ? '' : args[0];
  const config = require("../config.json");
  try {

    message.channel.send("Sending to GitHub...");

    const response = await fetch('https://api.github.com/repos/miodec/monkey-type/issues', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${config.githubApiToken}`,
        'accept': 'application/vnd.github.v3+json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        title: issueName,
        body: issueBody
      }) // body data type must match "Content-Type" header
    });

    let resJson = response.json();

    if (response.status === 201 && response.statusText == "Created") {
      return {
        status: true,
        message: "Done: " + resJson.url,
      };
    } else {
      return {
        status: false,
        message: "Something went wrong. Code "+ response.status
      }
    }

  } catch (e) {
    return {
      status: false,
      message: "Could not create issue: " + e.message,
    };
  }
};

module.exports.cmd = {
  name: "issue",
  needMod: true,
};
