import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserContext } from '../lib/getUserContext';
import { response } from '../lib/response';
import { listMembers } from './routes/team/listMembers';
import { updateMemberRole } from './routes/team/updateMemberRole';
import { updateMemberStatus } from './routes/team/updateMemberStatus';
import { inviteMember } from './routes/team/inviteMember';
import { listCustomers } from './routes/customers/listCustomers';
import { createCustomer } from './routes/customers/createCustomer';
import { getCustomer } from './routes/customers/getCustomer';
import { updateCustomer } from './routes/customers/updateCustomer';
import { deleteCustomer } from './routes/customers/deleteCustomer';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const cognitoSub = event.requestContext.authorizer?.claims?.sub;
    if (!cognitoSub) return response.error('Unauthorized', 401);

    const userContext = await getUserContext(cognitoSub);

    const method = event.httpMethod;
    const path = event.pathParameters?.proxy ?? '';

    
    // Team routes
    if (path === 'team/members' && method === 'GET')
      return listMembers(userContext);
    if (path.match(/^team\/members\/[\w-]+\/role$/) && method === 'PATCH')
      return updateMemberRole(userContext, event);
    if (path.match(/^team\/members\/[\w-]+\/status$/) && method === 'PATCH')
      return updateMemberStatus(userContext, event);
    if (path === 'team/invite' && method === 'POST')
      return inviteMember(userContext, event);

    // Customer routes
    if (path === 'customers' && method === 'GET')
      return listCustomers(userContext, event);
    if (path === 'customers' && method === 'POST')
      return createCustomer(userContext, event);
    if (path.match(/^customers\/[\w-]+$/) && method === 'GET')
      return getCustomer(userContext, event);
    if (path.match(/^customers\/[\w-]+$/) && method === 'PATCH')
      return updateCustomer(userContext, event);
    if (path.match(/^customers\/[\w-]+$/) && method === 'DELETE')
      return deleteCustomer(userContext, event);

    return response.error('Not found', 404);
  } catch (err: any) {
    console.error(err);
    return response.error(err.message ?? 'Internal server error', 500);
  }
};