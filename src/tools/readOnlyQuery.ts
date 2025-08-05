import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import prisma from "../lib/db";

// Define the schema for tool parameters
export const schema = {
  query: z.string().describe("The read-only SQL query to execute"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "readOnlyQuery",
  description: "Execute a read-only SQL query",
  annotations: {
    title: "Read Only Query",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function rawQuery({ query }: InferSchema<typeof schema>) {
  // Validate the query to ensure it's read-only
  const isReadOnly = /^\s*SELECT/i.test(query);

  if (!isReadOnly) {
    return {
      content: [
        {
          type: "text",
          text: "Error: Only read-only queries (starting with SELECT) are allowed.",
        },
      ],
    };
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error executing query: ${error.message}` }],
    };
  }
}
