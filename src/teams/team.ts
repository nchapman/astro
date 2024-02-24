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
      let currentPlan = this.plan;

      // Start by creating a plan if one wasn't provided
      if (!currentPlan) {
        let planPrompt = this.getPlanPrompt(input);
        let planResponse = await this.getResponse(planPrompt);
        let planResult = parseResponse(planResponse);

        if (this.verbose) {
          console.log("= Plan Prompt =\n", planPrompt);
          console.log("= Plan Response =\n", planResponse);
          console.log("= Plan Result =\n", planResult);
        }

        // If agents aren't required, then return the final answer
        if (planResult.thought?.includes("No") && planResult.finalAnswer) {
          output = planResult.finalAnswer;
          break;
        }
        // If agents are required, then set the plan
        else if (
          planResult.thought?.includes("Yes") &&
          planResult.finalAnswer
        ) {
          currentPlan = planResult.finalAnswer;
        }
        // If the plan is still undefined, then throw an error
        else {
          throw new Error("No plan created.");
        }
      }

      // Use the plan to guide the conversation
      let prompt = this.getPrompt(input, currentPlan, notes, exceedsMaxIter);
      let response = await this.getResponse(prompt);
      let result = parseResponse(response);

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

  getPrompt(
    input: string,
    plan: string,
    notes: string[],
    exceedsMaxIter: boolean
  ) {
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
      plan,
    });
  }

  getPlanPrompt(input: string) {
    return renderTemplate(prompts.makeAPlan, {
      input,
      backstory: this.backstory,
      goal: this.goal,
      agents: this.agents,
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
