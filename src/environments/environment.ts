import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'dev',
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  useMockApi: false
};
