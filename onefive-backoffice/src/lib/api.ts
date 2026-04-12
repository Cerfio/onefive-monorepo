import ky from 'ky';

export const api = ky.create({
  prefixUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') || 'http://localhost:3000',
  credentials: 'include',
  retry: 0,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          let message = 'Request failed';
          try {
            const json = await response.clone().json();
            message = json?.message || json?.error || message;
          } catch {
            // keep fallback message
          }
          throw new Error(message);
        }
      },
    ],
  },
});
