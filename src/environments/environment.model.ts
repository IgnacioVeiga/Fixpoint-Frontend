export interface AppEnvironment {
  name: 'dev' | 'prod' | 'qa' | 'mock';
  apiBaseUrl: string;
  useMockFallback: boolean;
}
