import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function updateMemberStatus(userContext: UserContext, event: APIGatewayProxyEvent) {
  if (!['OWNER', 'MANAGER'].includes(userContext.role))
    return response.error('Forbidden', 403);

  const memberId = event.pathParameters?.proxy?.split('/')[2];
  const body = JSON.parse(event.body ?? '{}');
  const { status } = body;

  if (!status || !['ACTIVE', 'INACTIVE'].includes(status))
    return response.error('Invalid status');

  await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `UPDATE "User" SET status = :status
            WHERE id = :id AND "businessId" = :businessId`,
      parameters: [
        { name: 'status', value: { stringValue: status } },
        { name: 'id', value: { stringValue: memberId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })
  );

  return response.ok({ id: memberId, status });
}