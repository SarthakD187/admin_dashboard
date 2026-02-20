import { getUserContext } from './getUserContext';

// Test: a user cannot access another tenant's businessId
async function testCrossTenantIsolation() {
  const cognitoSub = process.env.TEST_USER_SUB!;
  const expectedBusinessId = process.env.TEST_BUSINESS_ID!;

  const context = await getUserContext(cognitoSub);

  // Verify correct businessId is returned
  if (context.businessId !== expectedBusinessId) {
    throw new Error(
      `Isolation breach: expected ${expectedBusinessId}, got ${context.businessId}`
    );
  }

  // Verify an unknown user cannot get a context
  try {
    await getUserContext('non-existent-sub-12345');
    throw new Error('Should have thrown for unknown user');
  } catch (e: any) {
    if (e.message !== 'User not found or inactive') throw e;
  }

  console.log('✅ Cross-tenant isolation tests passed');
}

testCrossTenantIsolation().catch(console.error);