import { type ClientSchema, defineData } from '@aws-amplify/backend';
import { schema as sqlSchema } from './schema.sql';

const schema = sqlSchema
  .authorization(allow => [allow.guest()])
  .renameModels(() => [['todo', 'Todo']]);

export type Schema = ClientSchema<typeof schema>;

const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});

export default data;
