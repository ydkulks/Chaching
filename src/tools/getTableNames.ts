import { PrismaClient } from '@prisma/client';
import { ToolMetadata } from 'xmcp';

const prisma = new PrismaClient();

export const metadata: ToolMetadata = {
  name: 'get_table_names',
  description: 'Lists all tables from the database',
  annotations: {
    title: 'List Database Tables',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getTableNames(): Promise<{ content: Array<any> }> {
  try {
    const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `;

    return {
      content: [
        {
          type: 'text',
          text: 'Successfully retrieved the tables',
        },
        {
          type: 'text',
          text: 'Table Names: ' + JSON.stringify(tableNames.map(t => t.tablename), null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error listing database tables:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list database tables. Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  } finally {
    await prisma.$disconnect();
  }
}