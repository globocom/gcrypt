import express from 'express';
import supertest from 'supertest';

import Token from '../../../db/model/token';
import { SessionToken, SessionOptions } from '../../../auth/session';
import { tokenAuthentication } from '.';

describe('tokenAuthentication', () => {
  let webApp;

  beforeEach(() => {
    webApp = express();
    webApp.get('/authenticated/route', tokenAuthentication, (_, response) => {
      response.status(200).send('OK');
    });

    SessionOptions.set(new SessionOptions('my-awesome-secret', '1 day'));
  });

  it('When client does not provide the token into Authorization header, should return 401 with an expected method', async () => {
    await supertest(webApp)
      .get('/authenticated/route')
      .expect(401, 'Authentication token is missing or invalid');
  });

  it('When client does not provide the token, should return 401 with an expected method', async () => {
    await supertest(webApp)
      .get('/authenticated/route')
      .set('Authorization', 'Token my-invalid-token')
      .expect(401, 'Authentication token is missing or invalid');
  });

  it('When client provides a valid token, should access the wanted protected endpoint', async () => {
    const token = await SessionToken.sign({ jti: 'my-awesome-jti' });
    const claims = await SessionToken.verify(token);

    await new Token(claims).save();

    await supertest(webApp)
      .get('/authenticated/route')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, 'OK');
  });

  it('When the client provides a revoked valid token, should return 401 with an expected method', async () => {
    const token = await SessionToken.sign({ jti: 'my-awesome-jti', revoked: true });
    const claims = await SessionToken.verify(token);

    await new Token(claims).save();

    await supertest(webApp)
      .get('/authenticated/route')
      .set('Authorization', `Bearer ${token}`)
      .expect(401, 'Authentication token is missing or invalid');
  });

  it('When the client provides an invalid token such JTI is not on database, should return 401 with an expected method', async () => {
    SessionToken.verify = jest.fn()
      .mockRejectedValue('could not verify the token');

    const token = await SessionToken.sign({ jti: 'my-awesome-jti' });

    await supertest(webApp)
      .get('/authenticated/route')
      .set('Authorization', `Bearer ${token}`)
      .expect(401, 'Authentication token is missing or invalid');
  });
});
