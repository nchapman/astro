import Mustache from "mustache";

// Don't escape HTML entities
Mustache.escape = (text) => text;

export function renderTemplate(template: string, data = {}, partials = {}) {
  return Mustache.render(trimIndent(template), data, partials);
}

export function trimIndent(text: string) {
  // Split the text into lines
  const lines = text.trim().split("\n");

  // Find the minimum indentation level (ignore empty lines)
  const minIndent = lines.reduce((min: any, line: any) => {
    if (line.trim().length === 0) return min; // Skip empty lines
    const leadingSpaces = line.match(/^ */)[0].length;
    return Math.min(min, leadingSpaces);
  }, Infinity);

  // If all lines are empty or there's no indentation, return the original text
  if (minIndent === Infinity || minIndent === 0) {
    return text;
  }

  // Remove the calculated indentation from the beginning of each line
  const unindentedLines = lines.map((line) =>
    line.startsWith(" ") ? line.substring(minIndent) : line
  );

  // Join the lines back into a single string
  return unindentedLines.join("\n");
}
