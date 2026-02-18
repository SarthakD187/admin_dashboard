import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import data from './data/resource';
import { storage } from './storage/resource';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { postConfirmation } from './functions/post-confirmation/resource';
import { Function } from 'aws-cdk-lib/aws-lambda';



const backend = defineBackend({ auth, data, storage, postConfirmation });

const dbStack = backend.createStack('DatabaseStack');

const vpc = new ec2.Vpc(dbStack, 'DatabaseVpc', {
  maxAzs: 2,
  natGateways: 1,
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'public',
      subnetType: ec2.SubnetType.PUBLIC,
    },
    {
      cidrMask: 24,
      name: 'private',
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
  ],
});

const dbSecurityGroup = new ec2.SecurityGroup(dbStack, 'DbSecurityGroup', {
  vpc,
  description: 'Security group for Aurora Serverless v2',
  allowAllOutbound: true,
});

dbSecurityGroup.addIngressRule(
  ec2.Peer.ipv4(vpc.vpcCidrBlock),
  ec2.Port.tcp(5432),
  'Allow PostgreSQL from within VPC'
);

const cluster = new rds.DatabaseCluster(dbStack, 'AuroraCluster', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_16_6,
  }),
  writer: rds.ClusterInstance.serverlessV2('writer'),
  serverlessV2MinCapacity: 0.5,
  serverlessV2MaxCapacity: 2,
  vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
  securityGroups: [dbSecurityGroup],
  defaultDatabaseName: 'admindashboard',
  enableDataApi: true,
  credentials: rds.Credentials.fromGeneratedSecret('postgres'),
  removalPolicy: RemovalPolicy.DESTROY,
});

const postConfirmationLambda = backend.postConfirmation.resources.lambda as Function;
cluster.grantDataApiAccess(postConfirmationLambda);

postConfirmationLambda.addEnvironment('CLUSTER_ARN', cluster.clusterArn);
postConfirmationLambda.addEnvironment(
  'SECRET_ARN',
  cluster.secret?.secretArn ?? ''
);

new CfnOutput(dbStack, 'ClusterEndpoint', {
  value: cluster.clusterEndpoint.hostname,
  description: 'Aurora cluster writer endpoint',
});

new CfnOutput(dbStack, 'ClusterSecretArn', {
  value: cluster.secret?.secretArn ?? '',
  description: 'Secrets Manager ARN for database credentials',
});
