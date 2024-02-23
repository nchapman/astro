import OpenAI from "openai";
import Agent from "../agents/agent";
import prompts from "./prompts";
import { renderTemplate } from "../utils";
import { parseResponse } from "../parser";

interface TeamOptions {
  goal: string;
  backstory: string;
  plan?: string;
  llm: OpenAI;
  agents: Agent[];
  maxIter?: number;
  verbose?: boolean;
}

class Team {
  goal: string;
  backstory: string;
  plan?: string;
  llm: OpenAI;
  agents: Agent[];
  maxIter: number;
  verbose?: boolean;

  constructor(options: TeamOptions) {
    this.goal = options.goal;
    this.backstory = options.backstory;
    this.llm = options.llm;
    this.plan = options.plan;
    this.agents = options.agents;
    this.maxIter = options.maxIter || Math.max(this.agents.length, 5);
    this.verbose = options.verbose;
  }

  async call(input: string) {
    let output;
    let notes = [];
    let i = 0;

    while (output === undefined) {
      let exceedsMaxIter = i >= this.maxIter;
      let prompt = this.getPrompt(input, notes, exceedsMaxIter);
      let response = await this.getResponse(prompt);

      const result = parseResponse(response);

      if (this.verbose) {
        console.log("= Prompt =\n", prompt);
        console.log("= Response =\n", response);
        console.log("= Result =\n", result);
        console.log("Team iteration:", i);
      }

      if (result.finalAnswer) {
        output = result.finalAnswer;
      } else if (result.action) {
        const agent = this.agents.find((t) => t.role === result.action);

        if (agent) {
          const actionOutput = await agent.call(
            result.actionInput || "No instructions provided."
          );

          // Add the observation to the notes
          notes.push(`${response}\nAction Output: ${actionOutput}`);
        } else {
          // TODO: Better error handling
          // This could push an error into notes and continue
          output = "Sorry, I don't have that agent.";
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

  getPrompt(input: string, notes: string[], exceedsMaxIter: boolean) {
    let prompt;

    if (exceedsMaxIter) {
      // Force an answer if the max iterations have been exceeded
      prompt = prompts.withForcedAnswer;
    } else {
      prompt = prompts.withAgents;
    }

    // Render the prompt using the provided data
    return renderTemplate(prompt, {
      input,
      notes,
      backstory: this.backstory,
      goal: this.goal,
      agents: this.agents,
      plan: this.plan,
    });
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

export default Team;
