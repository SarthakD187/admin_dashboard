import {
  RDSDataClient,
  ExecuteStatementCommand,
} from '@aws-sdk/client-rds-data';

const client = new RDSDataClient({});

const CLUSTER_ARN = process.env.CLUSTER_ARN!;
const SECRET_ARN = process.env.SECRET_ARN!;
const DATABASE = 'admindashboard';

export interface UserContext {
  userId: string;
  businessId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
}

export async function getUserContext(cognitoSub: string): Promise<UserContext> {
  const result = await client.send(
    new ExecuteStatementCommand({
      resourceArn: CLUSTER_ARN,
      secretArn: SECRET_ARN,
      database: DATABASE,
      sql: `SELECT id, "businessId", role, status FROM "User" WHERE id::text = :id AND status = 'ACTIVE'`,
      parameters: [{ name: 'id', value: { stringValue: cognitoSub } }],
    })
  );

  const row = result.records?.[0];
  if (!row) throw new Error('User not found or inactive');

  return {
    userId: row[0].stringValue!,
    businessId: row[1].stringValue!,
    role: row[2].stringValue as UserContext['role'],
    status: row[3].stringValue as UserContext['status'],
  };
}