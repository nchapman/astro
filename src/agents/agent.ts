import OpenAI from "openai";
import Tool from "../tool";
import prompts from "./prompts";
import { renderTemplate } from "../utils";
import { parseResponse } from "./parser";

class Agent {
  role: string;
  goal: string;
  backstory: string;
  llm: OpenAI;
  tools: Tool[];
  maxIter: number;
  verbose?: boolean;

  constructor(options: AgentOptions) {
    this.role = options.role;
    this.goal = options.goal;
    this.backstory = options.backstory;
    this.llm = options.llm;
    this.tools = options.tools || [];
    this.maxIter = options.maxIter || 5;
    this.verbose = options.verbose;
  }

  async call(input: string) {
    let output;
    let notes = [];
    let i = 0;

    while (output === undefined) {
      let exceedsMaxIter = i >= this.maxIter;
      let prompt = this.getPrompt(exceedsMaxIter, { input, notes, ...this });
      let response = await this.getResponse(prompt);

      const result = parseResponse(response);

      if (this.verbose) {
        console.log("= Prompt =\n", prompt);
        console.log("= Response =\n", response);
        console.log("= Result =\n", result);
        console.log("Iteration:", i);
      }

      if (result.finalAnswer) {
        output = result.finalAnswer;
      } else if (result.action) {
        const tool = this.tools.find((t) => t.name === result.action);

        if (tool) {
          const actionOutput = tool.call(result.actionInput);

          // Add the observation to the notes
          notes.push(`${response}\nAction Output: ${actionOutput}`);
        } else {
          // TODO: Better error handling
          // This could push an error into notes and continue
          output = "Sorry, I don't have that tool.";
        }
      } else {
        // TODO: Better error handling
        output = "Sorry, something went wrong.";
      }

      i++;
    }

    // TODO: Better error handling
    return output || "Sorry, something went wrong.";
  }

  getPrompt(exceedsMaxIter: boolean, data: any) {
    let prompt;

    if (exceedsMaxIter) {
      // Force an answer if the max iterations have been exceeded
      prompt = prompts.withForcedAnswer;
    } else {
      if (this.tools.length > 0) {
        // Use the prompt with tools if the agent has tools
        prompt = prompts.withTools;
      } else {
        // Use simple prompt if the agent has no tools
        prompt = prompts.withoutTools;
      }
    }

    // Render the prompt using the provided data
    return renderTemplate(prompt, data);
  }

  async getResponse(prompt: string) {
    const response = await this.llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llamafile",
      stop: "\nAction Output:",
    });

    // TODO: Better error handling
    return response.choices[0].message.content || "Sorry something went wrong.";
  }
}

interface AgentOptions {
  role: string;
  goal: string;
  backstory: string;
  llm: OpenAI;
  tools?: Tool[];
  maxIter?: number;
  verbose?: boolean;
}

export default Agent;
