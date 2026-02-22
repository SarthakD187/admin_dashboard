import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function deleteCustomer(userContext: UserContext, event: APIGatewayProxyEvent) {
  const customerId = event.pathParameters?.proxy?.split('/')[1];

  await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `DELETE FROM "Customer"
            WHERE id = :id::uuid AND "businessId" = :businessId::uuid`,
      parameters: [
        { name: 'id', value: { stringValue: customerId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })
  );

  return response.ok({ id: customerId });
}