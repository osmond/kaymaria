import fs from "fs";
import OpenAI from "openai";
import { mockPlants } from "../mock/plants";
import { mockTasks } from "../mock/tasks";

async function generateTrainingFile(path: string) {
  const examples = mockTasks
    .filter((t) => t.completed)
    .map((t) => {
      const plant = mockPlants.find((p) => p.id === t.plantId);
      return {
        messages: [
          { role: "system", content: "You are a plant care assistant." },
          {
            role: "user",
            content: `I ${t.type}ed my ${plant?.name}. Notes: ${t.notes ?? ""}`,
          },
          {
            role: "assistant",
            content: `Logged ${t.type} for ${plant?.name}.`,
          },
        ],
      };
    });

  fs.writeFileSync(path, examples.map((e) => JSON.stringify(e)).join("\n"));
  return path;
}

async function main() {
  const filePath = await generateTrainingFile("fine-tune-data.jsonl");
  console.log(`Wrote training data to ${filePath}`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("OPENAI_API_KEY not set; skipping fine-tune job submission.");
    return;
  }

  const client = new OpenAI({ apiKey });
  const file = await client.files.create({
    file: fs.createReadStream(filePath),
    purpose: "fine-tune",
  });
  const job = await client.fineTuning.jobs.create({
    training_file: file.id,
    model: "gpt-3.5-turbo",
  });
  console.log("Fine-tune job created:", job.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
