import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function getCustomer(userContext: UserContext, event: APIGatewayProxyEvent) {
  const customerId = event.pathParameters?.proxy?.split('/')[1];

  const [customerResult, activityResult] = await Promise.all([
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT id, name, email, phone, notes, "createdAt"
            FROM "Customer"
            WHERE id = :id::uuid AND "businessId" = :businessId::uuid`,
      parameters: [
        { name: 'id', value: { stringValue: customerId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT a.id, a.type, a.description, a.amount, a."createdAt",
                   u.email as "userEmail"
            FROM "Activity" a
            JOIN "User" u ON a."userId" = u.id
            WHERE a."customerId" = :customerId::uuid
              AND a."businessId" = :businessId::uuid
            ORDER BY a."createdAt" DESC`,
      parameters: [
        { name: 'customerId', value: { stringValue: customerId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })),
  ]);

  const row = customerResult.records?.[0];
  if (!row) return response.error('Customer not found', 404);

  const activities = activityResult.records?.map((r) => ({
    id: r[0].stringValue,
    type: r[1].stringValue,
    description: r[2].stringValue ?? null,
    amount: r[3].stringValue ?? null,
    createdAt: r[4].stringValue,
    userEmail: r[5].stringValue,
  })) ?? [];

  return response.ok({
    id: row[0].stringValue,
    name: row[1].stringValue,
    email: row[2].stringValue ?? null,
    phone: row[3].stringValue ?? null,
    notes: row[4].stringValue ?? null,
    createdAt: row[5].stringValue,
    activities,
  });
}