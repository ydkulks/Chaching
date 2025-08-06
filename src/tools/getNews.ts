import { type ToolMetadata } from "xmcp";

// Define the schema for tool parameters
export const schema = {};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "getNews",
  description: "Fetch the latest stock market news",
  annotations: {
    title: "Get News",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function getNews() {
  const apiKey = process.env.INDIAN_API_KEY;
  const url = `https://stock.indianapi.in/news`;

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
