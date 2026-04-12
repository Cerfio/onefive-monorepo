// Set test environment variables — exécuté avant tout import de module
process.env.NODE_ENV = 'test';
process.env.SKIP_THROTTLE = 'true';
process.env.SKIP_WAITLIST = 'true';
process.env.KEY_AUTHENTICATION = process.env.KEY_AUTHENTICATION ?? 'test-key';
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'test-secret';
process.env.MOCK_EMAIL_SERVICE = 'true';
process.env.DISABLE_EMAIL_SENDING = 'true';

const originalFetch = globalThis.fetch?.bind(globalThis);

if (originalFetch) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const emailServiceUrl = process.env.ONEFIVE_MICROSERVICE_EMAIL_URL;
    const targetsEmailEndpoint = requestUrl.includes('/api/send');
    const targetsConfiguredEmailService =
      !emailServiceUrl || requestUrl.startsWith(emailServiceUrl);

    if (
      process.env.MOCK_EMAIL_SERVICE === 'true' &&
      targetsEmailEndpoint &&
      targetsConfiguredEmailService
    ) {
      return new Response(JSON.stringify({ mocked: true, accepted: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  }) as typeof fetch;
}
