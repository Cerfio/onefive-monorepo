import { KyInstance } from 'ky';
import { LoginResponseSchema, SignupResponseSchema } from '@/lib/definitions/auth.definition';

export class AuthApi {
  constructor(private readonly api: KyInstance) {}

  async signin(email: string, password: string) {
    const response = await this.api.post('auth/signin', {
      json: { email, password },
    });
    const payload = await response.json();
    const parsedPayload = LoginResponseSchema.parse(payload);
    return parsedPayload;
  }

  async signup({ email, password }: { email: string; password: string }) {
    const response = await this.api.post('auth/signup', {
      json: { email, password },
    });
    const payload = await response.json();
    const parsedPayload = SignupResponseSchema.parse(payload);
    return parsedPayload;
  }
}
