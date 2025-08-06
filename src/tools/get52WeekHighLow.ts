import { type ToolMetadata } from "xmcp";

// Define the schema for tool parameters
export const schema = {};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "get52WeekHighLow",
  description: "Fetch 52-week high/low data",
  annotations: {
    title: "Get 52-Week High/Low",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function get52WeekHighLow() {
  const apiKey = process.env.INDIAN_API_KEY;
  const url = `https://stock.indianapi.in/fetch_52_week_high_low_data`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey || "",
      },
    });
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      return {
        content: [{ type: "text", text: `Error: API returned non-JSON response. This could be due to an invalid API key or other error. Response: ${text}` }],
      };
    }
    const data = await response.json();

    return {
      content: [{ type: "json", text: data }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error fetching data: ${error.message}` }],
    };
  }
}
