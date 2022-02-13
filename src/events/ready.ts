import { Event } from "../interfaces/Event";

export default {
  event: "ready",
  run: async (client) => {
    console.log(`${client.user?.tag} is online!`);
  }
} as Event<"ready">;
