import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function listCustomers(userContext: UserContext, event: APIGatewayProxyEvent) {
  const search = event.queryStringParameters?.search ?? '';

  const result = await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT id, name, email, phone, notes, "createdAt"
            FROM "Customer"
            WHERE "businessId" = :businessId::uuid
            ${search ? `AND (name ILIKE :search OR email ILIKE :search)` : ''}
            ORDER BY "createdAt" DESC`,
      parameters: [
        { name: 'businessId', value: { stringValue: userContext.businessId } },
        ...(search ? [{ name: 'search', value: { stringValue: `%${search}%` } }] : []),
      ],
    })
  );

  const customers = result.records?.map((row) => ({
    id: row[0].stringValue,
    name: row[1].stringValue,
    email: row[2].stringValue ?? null,
    phone: row[3].stringValue ?? null,
    notes: row[4].stringValue ?? null,
    createdAt: row[5].stringValue,
  })) ?? [];

  return response.ok(customers);
}