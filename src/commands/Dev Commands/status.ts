import { Command, RolesEnum } from "../../interfaces/Command";
import { InstatusClient } from "instatus.ts";

const instatusClient = new InstatusClient({
  key: <string>process.env["INSTATUS_API_KEY"]
});

export default {
  name: "status",
  description: "Shows the status of the website",
  category: "Dev",
  options: [],
  roles: [RolesEnum.COLLABORATOR, RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async () => {
    const component = await instatusClient.pages.components.get("Website");

    instatusClient.pages.incidents.add({
      name: "test",
      message: "This is a test",
      started: new Date(Date.now()),
      status: "IDENTIFIED",
      notify: true,
      statuses: [
        {
          id: component.id,
          status: "MAJOROUTAGE"
        }
      ],
      components: [component.name]
    });
  }
} as Command;
