// import { z } from 'zod';
import { PoolClient, QueryResult } from 'pg';
import dbPool from '../lib/db';
import {
  type ToolMetadata,
  // type InferSchema
} from "xmcp";

// export const schema = {
//   database: z.string().describe("The name of the database to list")
// }

export const metadata: ToolMetadata = {
  name: "get_table_names",
  description: "Lists all tables from the database",
  annotations: {
    title: "List Database Tables",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

/**
  * Get table names from the database
 */
export default async function getTableNames(): Promise<{ content: Array<any> }> {
  let client: PoolClient | undefined;
  try {
    client = await dbPool.connect();
    const result: QueryResult<any> = await client.query("SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    const tableNames: any = result.rows.map(row => row.tablename);

    return {
      content: [
        {
          type: "text",
          text: "Successfully retrieved the tables",
        },
        {
          type: "json",
          json: { tables: tableNames }, // Provide structured data
        },
      ],
    };
  } catch (error) {
    console.error("Error listing database tables:", error);
    return {
      content: [
        {
          type: "text",
          text: `Failed to list database tables. Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
}
