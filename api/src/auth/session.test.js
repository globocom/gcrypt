import jwt from 'jsonwebtoken';

import { SessionToken, SessionOptions } from './session';

describe('SessionOptions', () => {
  it('', () => {
    const options = new SessionOptions('example', '1h');
    expect(SessionOptions.get()).toBeNull();
    SessionOptions.set(options);
    expect(SessionOptions.get()).toEqual(options);
  });
});

describe('SessionToken', () => {
  describe('sign', () => {
    beforeEach(() => {
      SessionOptions.set(new SessionOptions('example-of-secret', '1h'));
    });

    it('When signing an object, should return the expected JWT', () => {
      const { algorithm, expiration, secret } = SessionOptions.get();
      const data = { name: 'example', email: 'example@example.com' };
      const expected = jwt.sign(data, secret, { algorithm, expiresIn: expiration });
      expect(SessionToken.sign(data)).resolves.toEqual(expected);
    });

    it('When secret is not provided, should reject with an error', () => {
      SessionOptions.set(new SessionOptions(null, '1h'));
      expect(SessionToken.sign({})).rejects.toThrow();
    });
  });
});
