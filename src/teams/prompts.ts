const aboutYou = `
# About you
{{backstory}}
Your goal: {{goal}}
`.trim();

const agentInstructions = `
# Agents
Here's the list of available agents. Most agents should only be used once.

{{#agents}}
- {{role}}: {{goal}}
{{/agents}}
`.trim();

export const makeAPlan = `
${aboutYou}

${agentInstructions}

# Current message
{{input}}

# Instructions
Write a step-by-step plan to respond to the message using the provided agents.
You can use one or more agents. 
Use this format exactly:

\`\`\`
Thought: Do I need to use agents? Yes.
Final Answer: [your step-by-step plan]
\`\`\`

If you don't need to use agents, use this format exactly:

\`\`\`
Thought: Do I need to use agents? No.
Final Answer: [your response]
\`\`\`
`;

export const withAgents = `
${aboutYou}

${agentInstructions}

# Instructions
To use an agent, use this format exactly:

\`\`\`
Thought: Do I need to use an agent? Yes
Action: [agent name]
Action Input: [helpful context for the agent]
Action Output: [agent response]
\`\`\`

If you don't need to use an agent, use this format exactly:

\`\`\`
Thought: Do I need to use an agent? No
Final Answer: [your response]
\`\`\`

# Current message
{{input}}

{{#plan}}
# Your Plan
Follow this plan exactly:
{{.}}
{{/plan}}

# Steps taken so far
{{^notes}}
No steps have been taken yet. Follow the plan.
{{/notes}}
{{#notes}}
{{.}}
{{/notes}}
`.trim();

export const withForcedAnswer =
  withAgents +
  `\n\nObservation: Max iterations exceeded. Must return a Final Answer.
Thought: Do I need to use an agent? No`;

export default { makeAPlan, withAgents, withForcedAnswer };
