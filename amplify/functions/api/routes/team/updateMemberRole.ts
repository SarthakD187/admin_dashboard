import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function updateMemberRole(userContext: UserContext, event: APIGatewayProxyEvent) {
  if (userContext.role !== 'OWNER') return response.error('Forbidden', 403);

  const memberId = event.pathParameters?.proxy?.split('/')[2];
  const body = JSON.parse(event.body ?? '{}');
  const { role } = body;

  if (!role || !['OWNER', 'MANAGER', 'STAFF'].includes(role))
    return response.error('Invalid role');

  await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `UPDATE "User" SET role = :role
            WHERE id = :id AND "businessId" = :businessId`,
      parameters: [
        { name: 'role', value: { stringValue: role } },
        { name: 'id', value: { stringValue: memberId! } },
        { name: 'businessId', value: { stringValue: userContext.businessId } },
      ],
    })
  );

  return response.ok({ id: memberId, role });
}