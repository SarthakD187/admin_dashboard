import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbConfig } from '../../../lib/rdsClient';
import { response } from '../../../lib/response';
import type { UserContext } from '../../../lib/getUserContext';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export async function getAnalytics(userContext: UserContext, event: APIGatewayProxyEvent) {
  const { businessId } = userContext;
  const days = parseInt(event.queryStringParameters?.days ?? '30');

  const [
    customerCount,
    revenueTotal,
    activityCount,
    teamCount,
    revenueOverTime,
    activityByType,
  ] = await Promise.all([
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT COUNT(*) FROM "Customer" WHERE "businessId" = :businessId::uuid`,
      parameters: [{ name: 'businessId', value: { stringValue: businessId } }],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT COALESCE(SUM(amount), 0) FROM "Activity"
            WHERE "businessId" = :businessId::uuid AND amount IS NOT NULL`,
      parameters: [{ name: 'businessId', value: { stringValue: businessId } }],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT COUNT(*) FROM "Activity"
            WHERE "businessId" = :businessId::uuid
            AND "createdAt" >= NOW() - INTERVAL '1 month'`,
      parameters: [{ name: 'businessId', value: { stringValue: businessId } }],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT COUNT(*) FROM "User"
            WHERE "businessId" = :businessId::uuid AND status = 'ACTIVE'`,
      parameters: [{ name: 'businessId', value: { stringValue: businessId } }],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT DATE("createdAt") as date, COALESCE(SUM(amount), 0) as revenue
            FROM "Activity"
            WHERE "businessId" = :businessId::uuid
              AND "createdAt" >= NOW() - (:days * INTERVAL '1 day')
            GROUP BY DATE("createdAt")
            ORDER BY date ASC`,
      parameters: [
        { name: 'businessId', value: { stringValue: businessId } },
        { name: 'days', value: { longValue: days } },
      ],
    })),
    rdsClient.send(new ExecuteStatementCommand({
      ...dbConfig,
      sql: `SELECT type, COUNT(*) as count FROM "Activity"
            WHERE "businessId" = :businessId::uuid
              AND "createdAt" >= NOW() - (:days * INTERVAL '1 day')
            GROUP BY type
            ORDER BY count DESC`,
      parameters: [
        { name: 'businessId', value: { stringValue: businessId } },
        { name: 'days', value: { longValue: days } },
      ],
    })),
  ]);

  return response.ok({
    metrics: {
      customerCount: parseInt(customerCount.records?.[0]?.[0]?.longValue?.toString() ?? '0'),
      revenueTotal: parseFloat(revenueTotal.records?.[0]?.[0]?.stringValue ?? '0'),
      activityCount: parseInt(activityCount.records?.[0]?.[0]?.longValue?.toString() ?? '0'),
      teamCount: parseInt(teamCount.records?.[0]?.[0]?.longValue?.toString() ?? '0'),
    },
    revenueOverTime: revenueOverTime.records?.map((r) => ({
      date: r[0].stringValue,
      revenue: parseFloat(r[1].stringValue ?? '0'),
    })) ?? [],
    activityByType: activityByType.records?.map((r) => ({
      type: r[0].stringValue,
      count: parseInt(r[1].longValue?.toString() ?? '0'),
    })) ?? [],
  });
}