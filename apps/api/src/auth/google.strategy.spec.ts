import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  it('should return the normalized user profile from google profile data', () => {
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          GOOGLE_CLIENT_ID: 'client-id',
          GOOGLE_CLIENT_SECRET: 'client-secret',
          GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
        };

        return values[key];
      }),
    };
    const strategy = new GoogleStrategy(
      configService as unknown as ConfigService,
    );

    expect(
      strategy.validate('access-token', 'refresh-token', {
        name: {
          givenName: 'Mohamed',
          familyName: 'Silva',
        },
        emails: [{ value: 'mohamed@example.com' }],
        photos: [{ value: 'https://example.com/avatar.png' }],
      }),
    ).toEqual({
      email: 'mohamed@example.com',
      firstName: 'Mohamed',
      lastName: 'Silva',
      picture: 'https://example.com/avatar.png',
      accessToken: 'access-token',
    });
  });
});
