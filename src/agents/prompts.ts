export const withTools = `
# About you
You are {{role}}. {{backstory}}.
Your goal: {{goal}}.

# Tools
{{#tools}}
- {{name}}: {{description}}
{{/tools}}

# Instructions
To use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? Yes
Why: [reason for using tool]
Action: [tool name]
Action Input: [tool input]
Observation: [tool output]
\`\`\`

When you have the observation you need or if you do not need to use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? No
Final Answer: [your response]
\`\`\`

# Work so far
{{#notes}}
{{.}}
{{/notes}}

# Current task
{{input}}
`.trim();

export const withoutTools = `
# About you
You are {{role}}. {{backstory}}.
Your goal: {{goal}}.

# Instructions
Respond to the current task.

# Current task
{{input}}

Response:
`.trim();

export const withForcedAnswer =
  withTools +
  `Do I need to use a tool? No
Final Answer:`;

export default { withTools, withoutTools, withForcedAnswer };
