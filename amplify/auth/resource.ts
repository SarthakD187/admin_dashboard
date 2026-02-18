import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/post-confirmation/resource';

export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  groups: ['OWNER', 'MANAGER', 'STAFF'],
  triggers: {
    postConfirmation,
  },
});