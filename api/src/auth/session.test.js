import jwt from 'jsonwebtoken';

import { SessionToken, SessionOptions } from './session';

describe('SessionToken', () => {
  beforeEach(() => {
    SessionOptions.set(new SessionOptions('example-of-secret', '1h'));
  });

  describe('sign', () => {
    it('When signing an object, should return the expected JWT', async () => {
      const { algorithm, expiration, secret } = SessionOptions.get();
      const data = { name: 'example', email: 'example@example.com' };
      const token = await SessionToken.sign(data);
      expect(jwt.verify(token, secret, { algorithm, expiresIn: expiration }))
        .toMatchObject(data);
    });

    it('When secret is not provided, should reject with an error', async () => {
      SessionOptions.set(new SessionOptions(null, '1h'));
      await expect(SessionToken.sign({ example: 'data' }))
        .rejects.toThrow();
    });
  });

  describe('verify', () => {
    it('When the token parameter is a valid JWT, should resolve with the claims', async () => {
      const { algorithm, expiration, secret } = SessionOptions.get();
      const expected = { example: 'data' };
      const token = jwt.sign(expected, secret, { algorithm, expiresIn: expiration });
      await expect(SessionToken.verify(token))
        .resolves.toMatchObject(expected);
    });

    it('When the token parameter is not a valid JWT, should reject with an error', async () => {
      const { algorithm, expiration } = SessionOptions.get();
      const expected = { example: 'data' };
      const token = jwt.sign(expected, 'another-secret-key', { algorithm, expiresIn: expiration });
      await expect(SessionToken.verify(token))
        .rejects.toThrow();
    });
  });
});
