import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  RDSDataClient,
  ExecuteStatementCommand,
} from '@aws-sdk/client-rds-data';

const client = new RDSDataClient({});

const CLUSTER_ARN = process.env.CLUSTER_ARN!;
const SECRET_ARN = process.env.SECRET_ARN!;
const DATABASE = 'admindashboard';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { sub, email } = event.request.userAttributes;

  // Create Business record
  const businessResult = await client.send(
    new ExecuteStatementCommand({
      resourceArn: CLUSTER_ARN,
      secretArn: SECRET_ARN,
      database: DATABASE,
      sql: `INSERT INTO "Business" (name) VALUES (:name) RETURNING id`,
      parameters: [{ name: 'name', value: { stringValue: `${email}'s Business` } }],
    })
  );

  const businessId = businessResult.records?.[0]?.[0]?.stringValue;
  if (!businessId) throw new Error('Failed to create Business record');

  // Create User record
  await client.send(
    new ExecuteStatementCommand({
      resourceArn: CLUSTER_ARN,
      secretArn: SECRET_ARN,
      database: DATABASE,
      sql: `INSERT INTO "User" (id, "businessId", email, role, status) VALUES (:id, :businessId::uuid, :email, :role, :status)`,
      parameters: [
        { name: 'id', value: { stringValue: sub } },
        { name: 'businessId', value: { stringValue: businessId } },
        { name: 'email', value: { stringValue: email } },
        { name: 'role', value: { stringValue: 'OWNER' } },
        { name: 'status', value: { stringValue: 'ACTIVE' } },
      ],
    })
  );

  return event;
};