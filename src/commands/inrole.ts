import { MessageEmbedOptions } from "discord.js";
import { Command } from "../interfaces/Command";

export default {
  name: "inrole",
  description: "See what members have a role",
  category: "Utility",
  options: [
    {
      name: "role",
      description: "The role to what members",
      type: "ROLE",
      required: true
    }
  ],
  run: async (interaction, client) => {
    const apiRole = interaction.options.getRole("role", true);

    const guild = interaction.guild;

    if (guild === null) return;

    const role = await guild.roles.fetch(apiRole.id, {
      force: true,
      cache: true
    });

    if (role === null) return;

    const members = [
      ...role.members.values(),
      { user: { tag: "test1" } },
      { user: { tag: "test2" } },
      { user: { tag: "test1" } },
      { user: { tag: "test2" } },
      { user: { tag: "test1" } },
      { user: { tag: "test2" } },
      { user: { tag: "test1" } },
      { user: { tag: "test2" } },
      { user: { tag: "test1" } },
      { user: { tag: "test2" } }
    ].map((member) => member.user.tag);

    const maxPage = members.length === 0 ? 1 : Math.ceil(members.length / 5);

    const embedOptions: MessageEmbedOptions = {
      title: "In-Role",
      description: `Full list of people with the \`${role.name}\` role:`,
      color: 0x5aef5c,
      thumbnail: {
        url: guild.iconURL({ dynamic: true }) ?? ""
      }
    };

    client.paginate(
      embedOptions,
      interaction,
      maxPage,
      5,
      members,
      "inrole",
      "Members"
    );
  }
} as Command;
