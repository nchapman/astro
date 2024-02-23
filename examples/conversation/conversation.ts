import OpenAI from "openai";
import Agent from "../../src/agents/agent";
import WeatherTool from "../tools/weather";

const llm = new OpenAI({
  baseURL: "http://127.0.0.1:8080/v1",
  apiKey: "none",
});

async function getOutput(messages: any) {
  const response = await llm.chat.completions.create({
    messages,
    model: "llamafile",
  });

  return response.choices[0].message.content || "Sorry something went wrong.";
}

const weatherAgent = new Agent({
  role: "Weather Reporter",
  goal: "Answer questions about the weather",
  backstory: "You are an expert on the weather and love to give advice.",
  llm,
  tools: [new WeatherTool()],
  verbose: true,
});

const messages = [];

messages.push({
  role: "system",
  content:
    "You are Astro, a friendly chatbot. You are helpful, kind, honest, good at writing, and never fail to answer any requests immediately and with precision.",
});

const prompt = "User: ";
process.stdout.write(prompt);

for await (const line of console) {
  if (line === "exit" || line === "quit") {
    process.exit(0);
  }

  messages.push({ role: "user", content: line });

  let output;
  if (line.includes("weather")) {
    output = await weatherAgent.call(line);
  } else {
    output = await getOutput(messages);
  }

  messages.push({ role: "system", content: output });

  process.stdout.write("Astro: " + output.trimEnd() + "\n");
  process.stdout.write(prompt);
}
