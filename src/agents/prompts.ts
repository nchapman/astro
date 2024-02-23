const aboutYou = `
# About you
You are {{role}}. {{backstory}}.
Your goal: {{goal}}.
`.trim();

export const withTools = `
${aboutYou}

# Tools
Here's the list of available tools. Most tools should only be used once.

{{#tools}}
- {{name}}: {{description}}
{{/tools}}

# Instructions
To use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? Yes
Action: [tool name]
Action Input: [tool input]
Action Output: [tool output]
\`\`\`

If you don't need to use a tool, use this format exactly:

\`\`\`
Thought: Do I need to use a tool? No
Final Answer: [your response]
\`\`\`

# Current task
{{input}}

{{#notes}}
# Summary of your work so far
{{#.}}
{{.}}
{{/.}}
{{/notes}}
`.trim();

export const withoutTools = `
${aboutYou}

# Instructions
Respond to the current task.

# Format
All responses should be in this format:

\`\`\`
Final Answer: [your response]
\`\`\`

# Current task
{{input}}
`.trim();

// TODO: Fix this prompt as it doens't match with changes to the withTools prompt
export const withForcedAnswer =
  withTools +
  `\n\nObservation: Max iterations exceeded. Must return a Final Answer.
Thought: Do I need to use a tool? No`;

export default { withTools, withoutTools, withForcedAnswer };
