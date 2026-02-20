import { RDSDataClient } from '@aws-sdk/client-rds-data';

export const rdsClient = new RDSDataClient({});

export const dbConfig = {
  resourceArn: process.env.CLUSTER_ARN!,
  secretArn: process.env.SECRET_ARN!,
  database: 'admindashboard',
};