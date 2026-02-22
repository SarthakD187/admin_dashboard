import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function createCustomer(userContext: UserContext, event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body ?? '{}');
  const { name, email, phone, notes } = body;

  if (!name?.trim()) return response.error('Name is required');

  const result = await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `INSERT INTO "Customer" ("businessId", name, email, phone, notes)
            VALUES (:businessId::uuid, :name, :email, :phone, :notes)
            RETURNING id, name, email, phone, notes, "createdAt"`,
      parameters: [
        { name: 'businessId', value: { stringValue: userContext.businessId } },
        { name: 'name', value: { stringValue: name.trim() } },
        { name: 'email', value: email ? { stringValue: email } : { isNull: true } },
        { name: 'phone', value: phone ? { stringValue: phone } : { isNull: true } },
        { name: 'notes', value: notes ? { stringValue: notes } : { isNull: true } },
      ],
    })
  );

  const row = result.records?.[0];
  if (!row) throw new Error('Failed to create customer');

  return response.ok({
    id: row[0].stringValue,
    name: row[1].stringValue,
    email: row[2].stringValue ?? null,
    phone: row[3].stringValue ?? null,
    notes: row[4].stringValue ?? null,
    createdAt: row[5].stringValue,
  }, 201);
}
