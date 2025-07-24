import { z } from 'zod';
import { PoolClient, QueryResult } from 'pg';
import dbPool from '../lib/db';
import {
  type ToolMetadata,
  type InferSchema
} from "xmcp";

export const schema = {
  table: z.string().describe("The name of the table to get the schema for")
}

export const metadata: ToolMetadata = {
  name: "get_table_schema",
  description: "Get the schema for a table",
  annotations: {
    title: "List Database Tables",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

/**
  * Get table schema from the database
 */
export default async function getTableSchema(
  { table }: InferSchema<typeof schema>)
  : Promise<{ content: Array<any> }> {

  let client: PoolClient | undefined;
  try {
    client = await dbPool.connect();

    const schema: QueryResult<any> = await client.query(
      `SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${table}'
      ORDER BY ordinal_position; `
    );

    const indexes: QueryResult<any> = await client.query(
      `SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = '${table}' AND schemaname = 'public';`
    );

    const triggers: QueryResult<any> = await client.query(
      `SELECT
        tgname AS trigger_name,
        pg_get_triggerdef(tr.oid) AS trigger_definition
      FROM pg_trigger tr
      JOIN pg_class tbl ON tbl.oid = tr.tgrelid
      JOIN pg_namespace n ON n.oid = tbl.relnamespace
      WHERE tbl.relname = '${table}'
      AND n.nspname = 'public'
      AND NOT tr.tgisinternal; `
    );

    return {
      content: [
        {
          type: "text",
          text: "Successfully retrieved the table schema",
        },
        {
          type: "text",
          text: "Table Schema: " + JSON.stringify(schema.rows, null, 2),
        },
        {
          type: "text",
          text: "Table Indexes: " + JSON.stringify(indexes.rows, null, 2),
        },
        {
          type: "text",
          text: "Table triggers: " + JSON.stringify(triggers.rows, null, 2),
        },
      ],
    }
  } catch (error) {
    console.error("Error table schema:", error);
    return {
      content: [
        {
          type: "text",
          text: `Failed to list table schema. Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
}
