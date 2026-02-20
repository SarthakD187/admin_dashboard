import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function inviteMember(userContext: UserContext, event: APIGatewayProxyEvent) {
  if (userContext.role !== 'OWNER') return response.error('Forbidden', 403);

  const body = JSON.parse(event.body ?? '{}');
  const { email, role } = body;

  if (!email || !role || !['OWNER', 'MANAGER', 'STAFF'].includes(role))
    return response.error('Invalid email or role');

  await rdsClient.send(
    new ExecuteStatementCommand({
      ...dbConfig,
      sql: `INSERT INTO "Invitation" ("businessId", email, role, "invitedBy")
            VALUES (:businessId::uuid, :email, :role, :invitedBy)`,
      parameters: [
        { name: 'businessId', value: { stringValue: userContext.businessId } },
        { name: 'email', value: { stringValue: email } },
        { name: 'role', value: { stringValue: role } },
        { name: 'invitedBy', value: { stringValue: userContext.userId } },
      ],
    })
  );

  return response.ok({ email, role, status: 'PENDING' }, 201);
}