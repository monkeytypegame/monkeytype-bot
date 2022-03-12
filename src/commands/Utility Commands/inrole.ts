import { MessageEmbedOptions } from "discord.js";
import { Command, RolesEnum } from "../../interfaces/Command";

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
  roles: [RolesEnum.MEMBER],
  run: async (interaction, client) => {
    const apiRole = interaction.options.getRole("role", true);

    const guild = interaction.guild;

    if (guild === null) return;

    const role = await guild.roles.fetch(apiRole.id, {
      force: true,
      cache: true
    });

    if (role === null) return;

    const members = [...role.members.values()].map((member) => member.user.tag);

    const embedOptions: MessageEmbedOptions = {
      title: "In-Role",
      description: `Full list of people with the \`${role.name}\` role:`,
      color: 0x5aef5c,
      thumbnail: {
        url: guild.iconURL({ dynamic: true }) ?? ""
      }
    };

    client.paginate({
      embedOptions,
      interaction,
      amount: 5,
      entries: members,
      id: "inrole",
      fieldName: "Members"
    });
  }
} as Command;
