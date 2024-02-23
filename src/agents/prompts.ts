const aboutYou = `
# About you
You are {{role}}. {{backstory}}.
Your goal: {{goal}}.
`.trim();

export const withTools = `
${aboutYou}

# Tools
{{#tools}}
- {{name}}: {{description}}
{{/tools}}

# Instructions
To use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? Yes
Action: [tool name]
Action Input: [tool input]
Observation: [tool output]
\`\`\`

When you have an Observation or don't need to use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? No
Final Answer: [your response]
\`\`\`

# Work history
{{#notes}}
{{.}}
{{/notes}}

# Current task
{{input}}
`.trim();

export const withoutTools = `
${aboutYou}

# Instructions
Respond to the current task.

# Current task
{{input}}

Response:
`.trim();

// TODO: Fix this prompt as it doens't match with changes to the withTools prompt
export const withForcedAnswer =
  withTools +
  `\n\nObservation: Max iterations exceeded. Must return a Final Answer.
Thought: Do I need to use a tool? No`;

export default { withTools, withoutTools, withForcedAnswer };
