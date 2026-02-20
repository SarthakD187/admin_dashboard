import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';

export async function listMembers(userContext: UserContext) {
  const result = await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT id, email, role, status, "createdAt", "lastActiveAt"
            FROM "User"
            WHERE "businessId" = :businessId::uuid
            ORDER BY "createdAt" ASC`,
      parameters: [
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })
  );

  const members = result.records?.map((row) => ({
    id: row[0].stringValue,
    email: row[1].stringValue,
    role: row[2].stringValue,
    status: row[3].stringValue,
    createdAt: row[4].stringValue,
    lastActiveAt: row[5].stringValue ?? null,
  })) ?? [];

  return response.ok(members);
}