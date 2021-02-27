const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit("../../monkeytype");

let arguments = process.argv.slice(2);

//quote content
//quote source
//quote language

if (arguments.length !== 3) {
  console.log(
    JSON.stringify({
      status: false,
      message: "Exactly 3 arguments expected.",
    })
  );
  return;
}

try {
  let quoteObject = {
    text: arguments[0],
    source: arguments[1],
    length: arguments[0].length,
  };

  let returnValue = {
    status: false,
    message: "No message",
  };

  const fileDir = `../../monkeytype/static/quotes/${arguments[2]}.json`;

  if (fs.existsSync(fileDir)) {
    let quoteFile = fs.readFileSync(fileDir);
    quoteFile = JSON.parse(quoteFile.toString());
    let newid =
      Math.max.apply(
        Math,
        quoteFile.quotes.map(function (q) {
          return q.id;
        })
      ) + 1;
    quoteObject.id = newid;
    quoteFile.quotes.push(quoteObject);
    returnValue.status = true;
    returnValue.message = `Added quote to ${arguments[2]}.json.`;
  } else {
    //file doesnt exist, create it
    quoteObject.id = 1;
    fs.writeFileSync(
      fileDir,
      JSON.stringify({
        language: arguments[2],
        groups: [
          [0, 100],
          [101, 300],
          [301, 600],
          [601, 9999],
        ],
        quotes: [quoteObject],
      })
    );
    returnValue.status = true;
    returnValue.message = `Created file ${arguments[2]}.json and added quote.`;
  }
  git.pull("upstream", "master");
  git.add([`static/quotes/${arguments[2]}.json`]);
  git.commit(`Added quote to ${arguments[2]}.json`);
  git.push("origin", "master");

  console.log(JSON.stringify(returnValue));
} catch (e) {
  console.log(
    JSON.stringify({
      status: false,
      message: `Something went wrong: ${e}`,
    })
  );
  return;
}
