import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'development',
  apiBaseUrl: 'http://localhost:5000/api/v1',
  appBaseUrl: 'http://localhost:4200',
  mediaCdnBaseUrl: 'http://localhost:9000/fashion-catalog-public'
};
