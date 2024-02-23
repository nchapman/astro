import OpenAI from "openai";
import Agent from "./agents/agent";

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
    this.maxIter = options.maxIter || 10;
    this.verbose = options.verbose;
  }
}

export default Team;
