/** @format */

import * as fs from "fs";
import { join } from "path";
import SimpleGit from "simple-git";
import config from "./config/config.json";
import { parseJSON, readOptionalFile } from "./functions/file";
import { MonkeyTypes } from "./types/types";

const repoPath = join(process.cwd(), config.repoPath);

const git = SimpleGit(repoPath);

const args = process.argv.slice(2);

(async () => {
  if (args.length !== 3) {
    console.log("Exactly 3 arguments expected.");

    return;
  }

  const [text, source, language] = args;

  if (text === undefined || source === undefined || language === undefined) {
    console.log("Arguments must be strings.");

    return;
  }

  const length = text.length;

  const filePath = join(
    repoPath,
    "frontend",
    "static",
    "quotes",
    `${language}.json`
  );

  const quoteFile = parseJSON<MonkeyTypes.QuoteCollection | undefined>(
    readOptionalFile(filePath),
    undefined
  );

  const id =
    quoteFile !== undefined
      ? Math.max(...quoteFile.quotes.map((quote) => quote.id))
      : 1;

  const quoteObject: MonkeyTypes.Quote = {
    text,
    source,
    length,
    id
  };

  if (quoteFile !== undefined) {
    quoteFile.quotes.push(quoteObject);
  } else {
    fs.writeFileSync(
      filePath,
      JSON.stringify(<MonkeyTypes.QuoteCollection>{
        language,
        groups: [
          [0, 100],
          [101, 300],
          [301, 600],
          [601, 9999]
        ],
        quotes: [quoteObject]
      })
    );
  }

  git.pull("upstream", "dev");
  git.add([`frontend/static/quotes/${language}.json`]);
  git.commit(`Added quote to ${language}.json`);
  git.push("origin", "dev");

  console.log(`Added quote to ${language}.json`);
})();
