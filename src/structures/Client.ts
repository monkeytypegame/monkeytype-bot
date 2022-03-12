import {
  ApplicationCommandOptionData,
  Client as DiscordClient,
  ClientEvents,
  Collection,
  CommandInteraction,
  Guild,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageEmbedOptions
} from "discord.js";
import { ClientOptions } from "../interfaces/ClientOptions";
import { Command } from "../interfaces/Command";
import globCB from "glob";
import { promisify } from "util";
import { resolve } from "path";
import { Event } from "../interfaces/Event";
import { APIMessage } from "discord-api-types";
import { queue } from "async";
import { Task } from "../interfaces/Task";

interface PaginationOptions<T> {
  embedOptions: MessageEmbedOptions;
  interaction: CommandInteraction;
  amount: number;
  entries: T[];
  id: string;
  fieldName: string;
  send?: (
    embed: MessageEmbed,
    row: MessageActionRow
  ) => Promise<Message | APIMessage>;
}

export class Client extends DiscordClient {
  public clientOptions: ClientOptions;
  public glob = promisify(globCB);
  public iconURL =
    "https://pbs.twimg.com/profile_images/1430886941189230595/RS0odgx9_400x400.jpg";
  public commands: Collection<string, Command> = new Collection();
  public categories: string[] = [];
  public taskQueue = queue<Task>(async (task, callback) => {
    console.log(`queue length: ${this.taskQueue.length()}`);

    const result = await task.run(this, (await this.guild) as Guild);

    console.log(result);

    if (result.status) {
      console.log(`Task ${task.name} completed.`);
      console.log(result.message);
      this.logInBotLogChannel(result.message);
    } else {
      console.log(result.message);
      this.logInBotLogChannel(result.message);
    }

    callback();
  });
  constructor(options: ClientOptions) {
    super(options);

    this.clientOptions = options;
  }

  public async start(token: string) {
    await this.login(token);

    const [commands, events] = await this.load();

    this.emit("ready", this as DiscordClient<true>);

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
    )) as Event<keyof ClientEvents>[];

    events.forEach((event) => this.on(event.event, event.run.bind(null, this)));

    // Handing slash commands

    const slashCommands = await this.application?.commands.fetch({
      guildId: this.clientOptions.guildId,
      force: true,
      cache: true
    });

    commands.forEach((command) => {
      this.commands.set(command.name, command);

      if (!this.categories.includes(command.category))
        this.categories.push(command.category);

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
              options: command.options as ApplicationCommandOptionData[]
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
          options: <ApplicationCommandOptionData[]>command.options
        });
      }
    });

    return [this.commands.size, events.length];
  }

  public embed(embedOptions: MessageEmbedOptions) {
    if (!embedOptions.title?.startsWith(this.user?.username ?? "George"))
      embedOptions.title = `${this.user?.username ?? "George"}: \`${
        embedOptions.title
      }\``;

    embedOptions.footer = {
      text: "www.monkeytype.com",
      iconURL: this.iconURL
    };

    if (embedOptions.author === undefined)
      embedOptions.author = {
        name: this.user?.username ?? "George",
        iconURL: this.user?.avatarURL({ dynamic: true }) ?? ""
      };

    const embed = new MessageEmbed(embedOptions);

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
      send
    } = options;

    const maxPage =
      entries.length === 0 ? 1 : Math.ceil(entries.length / amount);

    let page: number = 0;

    if (embedOptions.fields === undefined) embedOptions.fields = [];

    embedOptions.fields.push({
      name: fieldName,
      value:
        entries.slice(page * amount, page * amount + amount).join("\n") ||
        "None"
    });

    let embed = this.embed(embedOptions);

    const row = new MessageActionRow();

    row.addComponents([
      new MessageButton()
        .setCustomId(`${id.toLowerCase()}PreviousPage`)
        .setEmoji("⬅️")
        .setLabel("Previous")
        .setStyle("PRIMARY")
        .setDisabled(false),
      new MessageButton()
        .setCustomId(`${id.toLowerCase()}PageDisplay`)
        .setLabel(`Page ${page + 1} of ${maxPage}`)
        .setStyle("SECONDARY")
        .setDisabled(true),
      new MessageButton()
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
            components: [row],
            fetchReply: true
          })
        : await send(embed, row);

    const collector = new InteractionCollector(this, {
      channel: interaction.channel === null ? undefined : interaction.channel,
      componentType: "BUTTON",
      dispose: true,
      message: msg,
      time: 60000,
      interactionType: "MESSAGE_COMPONENT"
    });

    collector.on("collect", (buttonInteraction) => {
      if (!buttonInteraction.isButton()) return;

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

      if (embedOptions.fields === undefined) embedOptions.fields = [];

      embedOptions.fields[
        embedOptions.fields.findIndex((field) => field.name === fieldName)
      ] = {
        name: fieldName,
        value:
          entries.slice(page * amount, page * amount + amount).join("\n") ||
          "None",
        inline: false
      };

      embed = this.embed(embedOptions);

      if (row.components[1])
        (row.components[1] as MessageButton).setLabel(
          `Page ${page + 1} of ${maxPage}`
        );

      interaction.editReply({ embeds: [embed], components: [row] });
      buttonInteraction.update({});
    });
  }

  public async logInBotLogChannel(
    message: string
  ): Promise<Message | undefined> {
    if (
      this.clientOptions.channels.botLog !== null &&
      this.clientOptions.channels.botLog !== undefined
    ) {
      const channel = (await this.guild)?.channels.cache.find(
        (ch) => ch.id === this.clientOptions.channels.botLog
      );

      if (channel !== undefined && channel.isText())
        return channel.send(message);
    }

    return;
  }

  public get guild(): Promise<Guild | undefined> {
    return this.guilds.fetch({
      guild: this.clientOptions.guildId,
      force: true,
      cache: true
    });
  }

  public getCommandsByCategory(category: string): Command[] {
    return Array.from(
      this.commands.filter((cmd) => cmd.category === category).values()
    );
  }
}
