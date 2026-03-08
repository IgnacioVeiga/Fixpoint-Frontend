export interface AppEnvironment {
  name: 'dev' | 'prod' | 'qa' | 'mock';
  production: boolean;
  apiBaseUrl: string;
  useMockApi: boolean;
}
