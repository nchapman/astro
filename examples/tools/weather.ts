import Tool from "../../src/tool";

export default class WeatherTool extends Tool {
  name = "weather";
  description = "Get the current weather conditions for a provided city.";

  async call(city: string) {
    return `50 degrees with a 70% chance of rain in ${city}.`;
  }
}
