import { defineFunction } from '@aws-amplify/backend';

export const api = defineFunction({
  name: 'api',
  entry: './handler.ts',
});