import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'qa',
  production: false,
  apiBaseUrl: 'https://qa.fixpoint.local/api/v1',
  useMockApi: false
};
