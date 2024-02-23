type ResponseState =
  | "initial"
  | "action"
  | "actionInput"
  | "observation"
  | "thought"
  | "finalAnswer";

type ParsedResponse = {
  initial: string | null;
  thought: string | null;
  action: string | null;
  actionInput: string | null;
  observation: string | null;
  finalAnswer: string | null;
};

export function parseResponse(response: string): ParsedResponse {
  // Initial state
  let currentState: ResponseState = "initial";

  // Object to hold the results, initialized to null
  let result: ParsedResponse = {
    initial: null,
    action: null,
    actionInput: null,
    observation: null,
    thought: null,
    finalAnswer: null,
  };

  // Function to determine the new state based on a line
  const determineState = (line: string): ResponseState => {
    if (line.startsWith("Action:")) return "action";
    if (line.startsWith("Action Input:")) return "actionInput";
    if (line.startsWith("Observation:")) return "observation";
    if (line.startsWith("Thought:")) return "thought";
    if (line.startsWith("Final Answer:")) return "finalAnswer";
    return currentState; // No state change
  };

  // Split the response into lines and process each line
  response.split("\n").forEach((line) => {
    const newState = determineState(line);
    if (newState !== currentState) {
      currentState = newState; // Update the state
      // Initialize the value for this key, removing the key part from the line
      result[currentState] = line.substring(line.indexOf(":") + 1).trim();
    } else {
      // Append the line to the current state's value, adding a space for readability if it's not the first line
      if (result[currentState] != null) {
        result[currentState] += "\n" + line.trim();
      } else {
        result[currentState] = line.trim();
      }
    }
  });

  return result;
}
