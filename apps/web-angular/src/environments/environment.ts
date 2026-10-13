import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'development',
  cmsProvider: 'strapi',
  cmsApiBaseUrl: 'http://localhost:1337/api',
  cmsGraphqlUrl: 'http://localhost:1337/graphql',
  useMockContent: true,
  appBaseUrl: 'http://localhost:4200',
  mediaCdnBaseUrl: 'http://localhost:1337'
};
