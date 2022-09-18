# Monkeytype Discord Bot (George)

George is a Discord.JS (v13) bot that communicates with users in the Monkeytype Discord server by showing their stats and playing games. There are also some moderation features for Monkeytype specific things like Challenge Submissions and inserting quotes.

George needs direct access to the MongoDB and Redis databases associated with the Monkeytype backend server. George also needs access to the Monkeytype GitHub repository. Keep this in mind when [contributing](#contributing).

## Contributing

If you receive any errors during this process, contact us in the #development channel of our [Discord Server](https://discord.com/invite/monkeytype).

### Forking Monkeytype and Monkeytype-Bot

The first step to contribute is to ensure you have a fork and clone of the [Monkeytype repository](https://github.com/monkeytypegame/monkeytype) set up and working properly on your local machine. Please follow the [contributing guide](https://github.com/monkeytypegame/monkeytype/blob/master/CONTRIBUTING.md) to get a local website ready to go.

Next, you need to fork this repository and clone your fork, like you just did with the Monkeytype website. From now on, whenever `monkeytypegame/monkeytype-bot` or `monkeytypegame/monkeytype` is referenced, replace `monkeytypegame` with your GitHub username instead, so that you use your fork instead of the main repository.

### Creating a Discord Application

In order for George to use the Discord API, you need to create a Discord Bot that George can run in. Head over to the [Discord Developer Portal](https://discord.com/developers/applications/) and click `New Application`. Enter in a name and you should be greeted with a **General Information** page. You may edit the Description (About Me), App Icon, and App Name. Click on the `Bot` tab on the left. Then, click `Add Bot` and `Yes, do it!`. This creates a bot user that can be controlled by our software. Copy the bot token and store it somewhere safe, never show your bot token to anyone. Ensure that you enable the `Message Content` and `Presence` intents. You can invite the bot to your Discord server by clicking `OAuth2` on the left, selecting the `bot` and `application.commands` scopes, copying the given url and pasting it in a new browser tab.

### Developer Mode

In order to copy IDs from Discord, you may need to turn on Developer Mode which can be found in the User Settings > Appearance page at the bottom. Now when you right click on any Discord object (channel, role, user, etc.), you can click `Copy ID`.

### Configuration

George uses both a `.env` file and a `config.json` file. Copy the `example.env` file in the root directory and rename the copy to `.env`. In this file, put your MongoDB URI, Redis URI, [Discord Bot Token](#creating-a-discord-application), and [GitHub API Token](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). In `src/config`, copy and paste the `config_example.json` and rename it to `config.json`.
Input the following information:

 - `guildID`: The ID of the Discord server you invited George to.
 - `devID`: Your own ID.
 - `repo`: Your Monkeytype fork. For example: `monkeytypegame/monkeytype`
 - `repoPath`: The path to the local clone of your Monkeytype fork. If both George and Monkeytype are cloned to the same directory, you can skip this step.
 - `roles.memberRole`: The ID of a "Member" role on your Discord server. This role is used to identify users who have linked their Discord to Monkeytype.
 - `wpmRoles`: A list of roles that show the WPM of the Discord user's Monkeytype personal best. In each object, put the ID of the role in `id`, and the min and max WPM in the respective values.
 - `challenges`: The key should be the name of the challenge, and the value should be the ID of the role to give when someone completes that challenge.
 - `channels`: Replace each value with the ID for that respective channel.

### Installation

This project uses Yarn, so ensure you have it installed. You can install it by running the following command in a terminal (assuming you have NodeJS installed, which you should if you have [set up Monkeytype](#forking-monkeytype-and-monkeytype-bot)):

```
npm install --global yarn
```

Once you have yarn installed, you can install all dependencies for George by running the following command in a terminal that is contained in the `monkeytype-bot` directory:

```
yarn
```

If you use Visual Studio Code (we recommend that you do), it is also helpful to install some extensions before making any changes. Install the following extensions:

 - JavaScript and TypeScript Nightly
 - Prettier
 - ESLint

### Running the Project

Finally, to run the project, run the following command in the terminal:

```
yarn dev
```

This starts a watch process that will restart when you make any changes. You can start it permanently by running:

```
yarn start
```

### Editing Code

Before changing any code, we recommend that you have a basic understanding of TypeScript and Discord.JS. We also recommend that you familiarize yourself with how we create commands, events, etc. so that you follow our ecosystem.

#### Prettier and ESLint
We enforce code style and consistency by using Prettier and ESLint. Before committing any changes, run the following commands in the terminal:

```
yarn lint:fix
```
```
yarn pretty:fix
```

### Committing Your Changes

To push your changes to your fork, run the following commands in the terminal:

```
git pull origin master
git add .
git commit -m "put a commit message here"
git push origin master
```

Note that you may replace `master` with the name of a branch you may create so that you can contribute many things at once.

After you have committed and pushed your changes to your fork, go on GitHub to your repository and click the button to make a pull request at the top. If you do not see that button, go to [the official monkeytype-bot repository](https://github.com/monkeytypegame/monkeytype-bot), click `Pull Requests` and `New pull request`. Make sure that you are trying to merge your branch from your fork into the master branch of the offical repository. Add a detailed title and description of what you changed and click `Create pull request`. Your changes will be reviewed by a maintainer and feedback will be provided.
