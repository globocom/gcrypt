import express from 'express';
import supertest from 'supertest';

import AuthenticationProvider from '../../auth';
import AuthRouter from './auth';
import OpenIDConnectProvider from '../../auth/oidc';

describe('/auth', () => {
  const app = express();
  app.use('/auth', AuthRouter);

  beforeEach(() => {
    AuthenticationProvider.set(undefined);
  });

  describe('GET /scheme', () => {
    it('When using OIDC authentication method, should return 200 with expected JSON message', async () => {
      const authorizationURL = 'https://api.gcrypt.example.com/auth/callback?...';

      const authorizationUrl = jest.fn()
        .mockReturnValue(authorizationURL);

      const client = { authorizationUrl };

      AuthenticationProvider.set(new OpenIDConnectProvider(client, { redirectURL: '', scopes: 'openid' }));

      const expected = {
        name: 'oidc',
        data: { authorizationURL },
      };

      await supertest(app)
        .get('/auth/scheme')
        .expect('Content-Type', /json/)
        .expect(200, expected);
    });

    it('When the server has no authentication provider, should return 500', async () => {
      await supertest(app)
        .get('/auth/scheme')
        .expect(500);
    });
  });

  describe('GET /callback', () => {
    it('When the server has no authentication provider, should return 500', async () => {
      await supertest(app)
        .get('/auth/callback')
        .expect(500);
    });

    it('When using OIDC authentication method, shoud call expected method and return 200', async () => {
      const provider = new OpenIDConnectProvider({}, {});
      provider.authorizationCallback = jest.fn();

      AuthenticationProvider.set(provider);

      await supertest(app)
        .get('/auth/callback?session_state=example&code=example')
        .expect(200);

      expect(provider.authorizationCallback).toBeCalled();
    });
  });
});
