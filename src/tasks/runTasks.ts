import { Client } from "../structures/Client";
import { resolve } from "path";
import { Task } from "../interfaces/Task";

export async function runTasks(client: Client) {
  const taskFiles = await client.glob(
    resolve(__dirname, "../", "tasks", "**", "*.{ts,js}")
  );

  const tasks = (await Promise.all(
    taskFiles.map(
      async (taskFilePath) =>
        (await import(taskFilePath)).default || (await import(taskFilePath))
    )
  )) as Task[];

  client.taskQueue.push(tasks);
}
