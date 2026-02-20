import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import data from './data/resource';
import { storage } from './storage/resource';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { postConfirmation } from './functions/post-confirmation/resource';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { api } from './functions/api/resource';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';

const backend = defineBackend({ auth, data, storage, postConfirmation, api });

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

new CfnOutput(dbStack, 'ClusterEndpoint', {
  value: cluster.clusterEndpoint.hostname,
  description: 'Aurora cluster writer endpoint',
});

new CfnOutput(dbStack, 'ClusterSecretArn', {
  value: cluster.secret?.secretArn ?? '',
  description: 'Secrets Manager ARN for database credentials',
});

const postConfirmationLambda = backend.postConfirmation.resources.lambda as Function;
cluster.grantDataApiAccess(postConfirmationLambda);
postConfirmationLambda.addEnvironment('CLUSTER_ARN', cluster.clusterArn);
postConfirmationLambda.addEnvironment('SECRET_ARN', cluster.secret?.secretArn ?? '');

const apiLambda = backend.api.resources.lambda as Function;
cluster.grantDataApiAccess(apiLambda);
apiLambda.addEnvironment('CLUSTER_ARN', cluster.clusterArn);
apiLambda.addEnvironment('SECRET_ARN', cluster.secret?.secretArn ?? '');

// API Gateway in its own stack to avoid circular dependency
const apiStack = backend.createStack('ApiStack');

const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
  apiStack,
  'ApiAuthorizer',
  { cognitoUserPools: [backend.auth.resources.userPool as cognito.IUserPool] }
);

const restApi = new apigateway.RestApi(apiStack, 'RestApi', {
  restApiName: 'admin-dashboard-api',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

const proxyResource = restApi.root.addResource('{proxy+}');
proxyResource.addMethod(
  'ANY',
  new apigateway.LambdaIntegration(apiLambda),
  {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  }
);

new CfnOutput(apiStack, 'ApiEndpoint', {
  value: restApi.url,
  description: 'REST API endpoint',
});