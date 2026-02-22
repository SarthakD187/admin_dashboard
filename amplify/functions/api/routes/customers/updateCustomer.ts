import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function updateCustomer(userContext: UserContext, event: APIGatewayProxyEvent) {
  const customerId = event.pathParameters?.proxy?.split('/')[1];
  const body = JSON.parse(event.body ?? '{}');
  const { name, email, phone, notes } = body;

  if (!name?.trim()) return response.error('Name is required');

  await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `UPDATE "Customer"
            SET name = :name, email = :email, phone = :phone, notes = :notes
            WHERE id = :id::uuid AND "businessId" = :businessId::uuid`,
      parameters: [
        { name: 'name', value: { stringValue: name.trim() } },
        { name: 'email', value: email ? { stringValue: email } : { isNull: true } },
        { name: 'phone', value: phone ? { stringValue: phone } : { isNull: true } },
        { name: 'notes', value: notes ? { stringValue: notes } : { isNull: true } },
        { name: 'id', value: { stringValue: customerId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })
  );

  return response.ok({ id: customerId, name, email, phone, notes });
}