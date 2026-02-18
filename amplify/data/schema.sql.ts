import { a } from '@aws-amplify/data-schema';
import { configure } from '@aws-amplify/data-schema/internals';
import { secret } from '@aws-amplify/backend';

export const schema = configure({
  database: {
    engine: 'postgresql',
    connectionUri: secret('SQL_CONNECTION_STRING'),
  },
}).schema({
  todo: a.model({
    id: a.integer().required(),
    content: a.string(),
    created_at: a.datetime(),
    updated_at: a.datetime(),
  }),
});
