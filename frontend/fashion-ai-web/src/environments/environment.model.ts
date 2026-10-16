export interface Environment {
  production: boolean;
  environmentName: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  appBaseUrl: string;
  mediaCdnBaseUrl?: string;
  supabaseUrl: string;
  supabaseKey: string;
}
