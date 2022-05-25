import { MonkeyTypes } from "../types/types";
import OpenAI from "openai-api";

const openAI = new OpenAI(process.env["OPENAI_API_KEY"] as string);

const startingPrompt = `The following is a conversation with George, a monkey. George is helpful, creative, clever, very friendly, and he loves bananas.\n\
You: Hello, George! How are you today?\n\
George: I'm doing well, thank you! I'm feeling very creative today.\n\
You: That's great! What have you been up to?\n\
George: I've been working on a new painting. I'm really excited about it. I think it's going to be my best one yet.\n\
You: Can you tell me what it's about?\n\
George: It's a landscape painting. I'm trying to capture the feeling of the jungle. It's a lot of fun to work on.\n\
You: What's your favorite fruit?\n\
George: I love bananas! They're my favorite fruit.\n`;

let stopped = false;
let isWaiting = false;
const waitTime = 3000;

let prompt = startingPrompt;

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot) {
      return;
    }

    const channel = await client.getChannel("chatWithGeorge");

    if (channel === undefined || message.channel.id !== channel.id) {
      return;
    }

    if (isWaiting) {
      message.reply("❌ The group is sending responses too fast!");

      return;
    }

    if (
      message.content === "!george stop" &&
      message.author.id === client.clientOptions.devID
    ) {
      stopped = true;

      message.reply("✅ George has been stopped!");

      return;
    } else if (
      message.content === "!george start" &&
      message.author.id === client.clientOptions.devID
    ) {
      stopped = false;

      message.reply("✅ George has been started!");

      return;
    } else if (message.content === "!george clear") {
      prompt = startingPrompt;

      message.reply("✅ Prompt cleared!");

      return;
    }

    if (stopped) {
      return;
    }

    prompt += `${message.author.username}: ${message.content}\n`;

    message.channel.sendTyping();

    isWaiting = true;

    const gptResponse = await openAI
      .complete({
        user: message.author.username,
        engine: "davinci",
        prompt,
        maxTokens: 60,
        temperature: 0.3,
        topP: 0.3,
        presencePenalty: 0,
        frequencyPenalty: 0.5,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ["\n", "\n\n"]
      })
      .catch((err) => {
        console.log(err);

        return { data: { choices: [{ text: "" }] } };
      });

    const response = gptResponse.data.choices[0]?.text;

    setTimeout(() => {
      isWaiting = false;
    }, waitTime);

    if (response === undefined || response === "") {
      return;
    }

    if (!response.startsWith("George: ")) {
      prompt = startingPrompt;

      return;
    }

    message.reply(response.substring("George: ".length));

    prompt += `${response}\n`;
  }
} as MonkeyTypes.Event<"messageCreate">;
