import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'staging',
  cmsProvider: 'strapi',
  cmsApiBaseUrl: 'https://staging-cms.example.com/api',
  cmsGraphqlUrl: 'https://staging-cms.example.com/graphql',
  useMockContent: false,
  appBaseUrl: 'https://staging.studio.example.com',
  mediaCdnBaseUrl: 'https://media.example.com'
};
