import { api } from '@/utils/kyInstance';
import { AuthApi } from './auth.api';

export class ApiClient {
  auth: AuthApi;

  constructor() {
    this.auth = new AuthApi(api);
  }
}

export default ApiClient;

export const apiClient = new ApiClient();
