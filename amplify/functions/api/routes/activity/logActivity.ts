import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function logActivity(userContext: UserContext, event: APIGatewayProxyEvent) {
  const customerId = event.pathParameters?.proxy?.split('/')[1];
  const body = JSON.parse(event.body ?? '{}');
  const { type, description, amount } = body;

  if (!type?.trim()) return response.error('Activity type is required');

  const result = await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `INSERT INTO "Activity" ("businessId", "customerId", "userId", type, description, amount)
            VALUES (:businessId::uuid, :customerId::uuid, :userId, :type, :description, :amount)
            RETURNING id, type, description, amount, "createdAt"`,
      parameters: [
        { name: 'businessId', value: { stringValue: userContext.businessId } },
        { name: 'customerId', value: { stringValue: customerId! } },
        { name: 'userId', value: { stringValue: userContext.userId } },
        { name: 'type', value: { stringValue: type.trim() } },
        { name: 'description', value: description ? { stringValue: description } : { isNull: true } },
        { name: 'amount', value: amount ? { doubleValue: parseFloat(amount) } : { isNull: true } },
      ],
    })
  );

  const row = result.records?.[0];
  if (!row) throw new Error('Failed to log activity');

  return response.ok({
    id: row[0].stringValue,
    type: row[1].stringValue,
    description: row[2].stringValue ?? null,
    amount: row[3].stringValue ?? null,
    createdAt: row[4].stringValue,
    userEmail: userContext.userId,
  }, 201);
}