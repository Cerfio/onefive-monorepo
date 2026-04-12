import { EmailService } from './email.service';

describe('EmailService', () => {
  const logger = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not call fetch when email sending is mocked/disabled', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousMockEmail = process.env.MOCK_EMAIL_SERVICE;

    process.env.NODE_ENV = 'test';
    process.env.MOCK_EMAIL_SERVICE = 'true';

    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({} as unknown as Response);

    const service = new EmailService(logger as any);

    await expect(
      service.sendEmail({
        to: 'test@example.com',
        type: 'SIGNUP_ALERT',
        payload: { id: '1' },
      }),
    ).resolves.toMatchObject({ mocked: true, accepted: true });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();

    fetchSpy.mockRestore();
    process.env.NODE_ENV = previousNodeEnv;
    process.env.MOCK_EMAIL_SERVICE = previousMockEmail;
  });
});
