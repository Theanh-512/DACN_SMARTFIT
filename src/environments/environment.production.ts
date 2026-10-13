import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  environmentName: 'production',
  cmsProvider: 'strapi',
  cmsApiBaseUrl: 'https://cms.example.com/api',
  cmsGraphqlUrl: 'https://cms.example.com/graphql',
  useMockContent: false,
  appBaseUrl: 'https://studio.example.com',
  mediaCdnBaseUrl: 'https://media.example.com'
};
