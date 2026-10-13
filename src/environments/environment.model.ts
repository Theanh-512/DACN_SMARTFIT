export interface Environment {
  production: boolean;
  environmentName: 'development' | 'staging' | 'production';
  cmsProvider: 'strapi' | 'payload';
  cmsApiBaseUrl: string;
  cmsGraphqlUrl?: string;
  useMockContent: boolean;
  appBaseUrl: string;
  mediaCdnBaseUrl?: string;
}
