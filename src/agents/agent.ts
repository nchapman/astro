import OpenAI from "openai";
import Tool from "../tool";
import prompts from "./prompts";
import { renderTemplate } from "../utils";

interface AgentOptions {
  role: string;
  goal: string;
  backstory: string;
  llm: OpenAI;
  tools?: Tool[];
  maxIter?: number;
  verbose?: boolean;
}

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
    this.maxIter = options.maxIter || 10;
    this.verbose = options.verbose;
  }

  async call(input: string) {
    let output;
    let notes = [];
    let i = 0;

    while (output === undefined) {
      if (i >= this.maxIter) {
        // This should just force an answer instead of throwing an error
        throw new Error("Max iterations reached");
      }

      const prompt = this.renderPrompt({ input, notes, ...this });
      const response = await this.getResponse(prompt);
      const result = this.parseResponse(response);

      if (this.verbose) {
        console.log("Iteration", i);
        console.log("Prompt:", prompt);
        console.log("Response:", response);
        console.log("Result:", result);
      }

      if (result.action) {
        const tool = this.tools.find((t) => t.name === result.action);

        if (tool) {
          const observation = tool.call(result.actionInput);

          // Format and push observation to the notes log
          notes.push(`${response}\nObservation: ${observation}`);
        } else {
          output = "Sorry, I don't have that tool.";
        }
      } else if (result.finalAnswer) {
        output = result.finalAnswer;
      }

      i++;
    }

    return output || "Sorry, something went wrong.";
  }

  renderPrompt(data: any) {
    let prompt;

    // Use different prompts based on whether the agent has tools
    if (this.tools.length > 0) {
      prompt = prompts.withTools;
    } else {
      prompt = prompts.withoutTools;
    }

    // Render the prompt using the provided data
    return renderTemplate(prompt, data);
  }

  async getResponse(prompt: string) {
    const response = await this.llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llamafile",
      stop: "\nObservation:",
    });

    return response.choices[0].message.content || "Sorry something went wrong.";
  }

  parseResponse(response: string): {
    thought: string | null;
    action: string | null;
    actionInput: string | null;
    observation: string | null;
    finalAnswer: string | null;
  } {
    // Regular expressions to match each part of the response
    const actionRegex = /^Action: (.*)$/m;
    const actionInputRegex = /^Action Input: (.*)$/m;
    const observationRegex = /^Observation: (.*)$/m;
    const thoughtRegex = /^Thought: (.*)$/m;
    const finalAnswerRegex = /^Final Answer: ([\s\S]*)$/m; // Allow for multi-line answers

    // Extracting the content of each section using the regular expressions
    const actionMatch = response.match(actionRegex);
    const actionInputMatch = response.match(actionInputRegex);
    const observationMatch = response.match(observationRegex);
    const thoughtMatch = response.match(thoughtRegex);
    const finalAnswerMatch = response.match(finalAnswerRegex);

    return {
      action: actionMatch ? actionMatch[1] : null,
      actionInput: actionInputMatch ? actionInputMatch[1] : null,
      observation: observationMatch ? observationMatch[1] : null,
      thought: thoughtMatch ? thoughtMatch[1] : null,
      finalAnswer: finalAnswerMatch ? finalAnswerMatch[1].trim() : null, // Trim to remove any leading/trailing whitespace
    };
  }
}

export default Agent;
