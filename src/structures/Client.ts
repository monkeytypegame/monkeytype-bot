/** @format */

import * as Discord from "discord.js";
import { Channels, ClientOptions } from "../interfaces/ClientOptions";
import type { Command } from "../interfaces/Command";
import globCB from "glob";
import { promisify } from "util";
import { resolve, join } from "path";
import { Event } from "../interfaces/Event";
import { APIMessage } from "discord-api-types";
import { queue } from "async";
import { QueuedTask, Task, TaskFile } from "../interfaces/Task";
import { mongoDB } from "../functions/mongodb";

interface PaginationOptions<T> {
  embedOptions: Discord.MessageEmbedOptions;
  interaction: Discord.CommandInteraction;
  amount: number;
  entries: T[];
  id: string;
  fieldName: string;
  send?: (
    embed: Discord.MessageEmbed,
    row: Discord.MessageActionRow,
    currentEntries: T[]
  ) => Promise<Discord.Message | APIMessage>;
  onPageChange?: (
    embed: Discord.MessageEmbed,
    currentEntries: T[]
  ) => Discord.MessageEmbed;
}

export class Client extends Discord.Client {
  public clientOptions: ClientOptions;
  public glob = promisify(globCB);
  public iconURL =
    "https://pbs.twimg.com/profile_images/1430886941189230595/RS0odgx9_400x400.jpg";
  public commands = new Discord.Collection<string, Command>();
  public tasks = new Discord.Collection<string, TaskFile>();
  public categories: string[] = [];
  public permissionsAdded = new Set<string>();
  public taskQueue = queue<QueuedTask>(async (task, callback) => {
    console.log(`queue length: ${this.taskQueue.length()}`);

    const guild = await this.guild;

    if (guild === undefined) {
      console.error("Guild not found.");
      return;
    }

    const result = await task.run(this, guild, ...task.args);

    console.log(
      `Task ${task.name} finished ${
        result.status ? "successfully" : `with errors\n${result.message}`
      }.`
    );

    if (result.status) {
      console.log(`Task ${task.name} completed.`);
      console.log(result.message);
      this.logInBotLogChannel(result.message);
    } else {
      console.log(result.message);
      this.logInBotLogChannel(result.message);
    }

    const db = mongoDB();

    await db
      .collection("bot-tasks")
      .updateOne({ _id: task._id }, { $set: { executed: true } });

    await db.collection("bot-tasks").deleteOne({ _id: task._id });

    callback();
  });

  constructor(options: ClientOptions) {
    super(options);

    this.clientOptions = options;

    this.clientOptions.repoPath = join(
      process.cwd(),
      this.clientOptions.repoPath
    );
  }

  public async start(token: string) {
    await this.login(token);

    const [commands, events] = await this.load();

    this.emit("ready", <Discord.Client>this);

    return `Loaded ${commands} commands and ${events} events.`;
  }

  public async load(): Promise<[number, number]> {
    const commandFiles = await this.glob(
      resolve(
        __dirname,
        "../",
        this.clientOptions.commandsPath,
        "**",
        "*.{ts,js}"
      )
    );

    const eventFiles = await this.glob(
      resolve(
        __dirname,
        "../",
        this.clientOptions.eventsPath,
        "**",
        "*.{ts,js}"
      )
    );

    const taskFiles = await this.glob(
      resolve(__dirname, "../", this.clientOptions.tasksPath, "**", "*.{ts,js}")
    );

    const commands = (await Promise.all(
      commandFiles.map(
        async (commandFilePath) =>
          (await import(commandFilePath)).default ||
          (await import(commandFilePath))
      )
    )) as Command[];

    const events = (await Promise.all(
      eventFiles.map(
        async (eventFilePath) =>
          (await import(eventFilePath)).default || (await import(eventFilePath))
      )
    )) as Event<keyof Discord.ClientEvents>[];

    events.forEach((event) => this.on(event.event, event.run.bind(null, this)));

    const tasks = (await Promise.all(
      taskFiles.map(
        async (taskFilePath) =>
          (await import(taskFilePath)).default || (await import(taskFilePath))
      )
    )) as TaskFile[];

    tasks.forEach((task) => this.tasks.set(task.name, task));

    // Handing slash commands

    const slashCommands = await this.application?.commands.fetch({
      guildId: this.clientOptions.guildId,
      force: true,
      cache: true
    });

    commands.forEach((command) => {
      this.commands.set(command.name, command);

      if (!this.categories.includes(command.category)) {
        this.categories.push(command.category);
      }

      if (
        !slashCommands ||
        !slashCommands.find((appCommand) => appCommand.name === command.name)
      ) {
        this.application?.commands
          .create(
            {
              name: command.name,
              description: command.description,
              type: "CHAT_INPUT",
              options: command.options as Discord.ApplicationCommandOptionData[]
            },
            this.clientOptions.guildId
          )
          .then((c) =>
            console.log(
              `Successfully created slash command ${c.name} (${c.id}).`
            )
          )
          .catch(console.error);
      }
    });

    slashCommands?.forEach((slashCommand) => {
      const command = this.commands.get(slashCommand.name);

      if (command === undefined) {
        if (this.clientOptions.deleteUnusedSlashCommands) {
          slashCommand.delete();
        }
      } else {
        // add some code to edit the command if contents are different
        slashCommand.edit({
          name: command.name,
          description: command.description,
          options: <Discord.ApplicationCommandOptionData[]>command.options
        });
      }
    });

    return [this.commands.size, events.length];
  }

  public embed(embedOptions: Discord.MessageEmbedOptions) {
    if (!embedOptions.title?.startsWith(this.user?.username ?? "George")) {
      embedOptions.title = `${this.user?.username ?? "George"}: \`${
        embedOptions.title
      }\``;
    }

    embedOptions.footer = {
      text: "www.monkeytype.com",
      iconURL: this.iconURL
    };

    if (embedOptions.author === undefined) {
      embedOptions.author = {
        name: this.user?.username ?? "George",
        iconURL: this.user?.avatarURL({ dynamic: true }) ?? ""
      };
    }

    const embed = new Discord.MessageEmbed(embedOptions);

    embed.setTimestamp();

    return embed;
  }

  public async paginate<T>(options: PaginationOptions<T>) {
    const {
      embedOptions,
      interaction,
      amount,
      entries,
      id,
      fieldName,
      send,
      onPageChange
    } = options;

    const maxPage =
      entries.length === 0 ? 1 : Math.ceil(entries.length / amount);

    let page = 0;

    if (embedOptions.fields === undefined) {
      embedOptions.fields = [];
    }

    const currentEntries = entries.slice(page * amount, page * amount + amount);

    embedOptions.fields.push({
      name: fieldName,
      value: currentEntries.join("\n") || "None"
    });

    let embed = this.embed(embedOptions);

    const row = new Discord.MessageActionRow();

    row.addComponents([
      new Discord.MessageButton()
        .setCustomId(`${id.toLowerCase()}PreviousPage`)
        .setEmoji("⬅️")
        .setLabel("Previous")
        .setStyle("PRIMARY")
        .setDisabled(false),
      new Discord.MessageButton()
        .setCustomId(`${id.toLowerCase()}PageDisplay`)
        .setLabel(`Page ${page + 1} of ${maxPage}`)
        .setStyle("SECONDARY")
        .setDisabled(true),
      new Discord.MessageButton()
        .setCustomId(`${id.toLowerCase()}NextPage`)
        .setEmoji("➡️")
        .setLabel("Next")
        .setStyle("PRIMARY")
        .setDisabled(false)
    ]);

    const msg =
      send === undefined
        ? await interaction.reply({
            embeds: [embed],
            components: maxPage === 1 ? undefined : [row],
            fetchReply: true
          })
        : await send(embed, row, currentEntries);

    const collector = new Discord.InteractionCollector(this, {
      channel: interaction.channel === null ? undefined : interaction.channel,
      componentType: "BUTTON",
      dispose: true,
      message: msg,
      time: 60000,
      interactionType: "MESSAGE_COMPONENT"
    });

    collector.on("collect", (buttonInteraction) => {
      if (!buttonInteraction.isButton()) {
        return;
      }

      if (buttonInteraction.customId === `${id.toLowerCase()}PreviousPage`) {
        if (page <= 0) {
          page = 0;
          buttonInteraction.reply({
            ephemeral: true,
            content: "This is the first page."
          });
          return;
        }

        page--;
      } else if (buttonInteraction.customId === `${id.toLowerCase()}NextPage`) {
        if (page >= maxPage - 1) {
          page = maxPage - 1;
          buttonInteraction.reply({
            ephemeral: true,
            content: "This is the last page."
          });
          return;
        }

        page++;
      }

      if (embedOptions.fields === undefined) {
        embedOptions.fields = [];
      }

      const pageChangeEntries = entries.slice(
        page * amount,
        page * amount + amount
      );

      embedOptions.fields[
        embedOptions.fields.findIndex((field) => field.name === fieldName)
      ] = {
        name: fieldName,
        value: pageChangeEntries.join("\n") || "None",
        inline: false
      };

      embed = this.embed(embedOptions);
      if (onPageChange !== undefined) {
        embed = onPageChange(embed, pageChangeEntries);
      }

      if (row.components[1]) {
        (row.components[1] as Discord.MessageButton).setLabel(
          `Page ${page + 1} of ${maxPage}`
        );
      }

      interaction.editReply({
        embeds: [embed],
        components: maxPage === 1 ? undefined : [row]
      });
      buttonInteraction.update({});
    });
  }

  public async logInBotLogChannel(
    message: string
  ): Promise<Discord.Message | undefined> {
    const botLogChannel = await this.getChannel("botLog");

    if (botLogChannel !== undefined) {
      return botLogChannel.send(message);
    }

    return;
  }

  public get guild(): Promise<Discord.Guild | undefined> {
    return this.guilds.fetch({
      guild: this.clientOptions.guildId,
      cache: true
    });
  }

  public getCommandsByCategory(category: string): Command[] {
    return Array.from(
      this.commands.filter((cmd) => cmd.category === category).values()
    );
  }

  public async appendTasks(): Promise<void> {
    const db = mongoDB();

    const tasks = <Task[]>(
      await db.collection("bot-tasks").find({ executed: false }).toArray()
    );

    for (const task of tasks) {
      const taskFile = this.tasks.get(task.name);

      if (taskFile === undefined) {
        continue;
      }

      this.taskQueue.push({ ...task, ...taskFile });
    }
  }

  public async getWPMRole(wpm: number): Promise<Discord.Role | undefined> {
    const guild = await this.guild;

    if (guild === undefined) {
      return;
    }

    const roleID = this.clientOptions.wpmRoles.find(
      (role) => role.min <= wpm && wpm <= role.max
    )?.id;

    if (roleID === undefined) {
      return;
    }

    return guild.roles.cache.find((role) => role.id === roleID);
  }

  public async removeAllWPMRoles(member: Discord.GuildMember): Promise<void> {
    const guild = await this.guild;

    if (guild === undefined) {
      return;
    }

    const roles = this.clientOptions.wpmRoles.map((role) => role.id);

    const containedRoles = member.roles.cache.filter((role) =>
      roles.includes(role.id)
    );

    await member.roles.remove(containedRoles, "Removing WPM Roles");
  }

  public getUserWPMFromRole(member: Discord.GuildMember): number | undefined {
    const roles = this.clientOptions.wpmRoles.map((role) => role.id);

    const roleID = member.roles.cache.find((role) =>
      roles.includes(role.id)
    )?.id;

    if (roleID === undefined) {
      return;
    }

    const role = this.clientOptions.wpmRoles.find((role) => role.id === roleID);

    if (role === undefined) {
      return;
    }

    return role.max;
  }

  public async getChannel(
    channel: keyof Channels
  ): Promise<Discord.TextChannel | undefined> {
    const guild = await this.guild;

    const guildChannel = guild?.channels.cache.find(
      (ch) => ch.id === this.clientOptions.channels[channel]
    );

    if (!guildChannel?.isText()) {
      return;
    }

    if (guildChannel.type === "GUILD_TEXT") {
      return guildChannel;
    }

    return;
  }
}
