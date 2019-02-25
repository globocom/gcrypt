import Token from './token';

describe('Token', () => {
  describe('create', () => {
    it('', async () => {
      const claims = {
        jti: 'jti',
        email: 'email@example.com',
        exp: 1551055023,
        iat: 1551055023,
      };

      const token = await Token.create(claims);

      expect(token.issuedAt).toEqual(new Date(claims.iat * 1000));
      expect(token.expiresAt).toEqual(new Date(claims.exp * 1000));

      const expected = await Token.findOne({ jti: claims.jti }).exec();
      expect(token.toJSON()).toEqual(expected.toJSON());
    });
  });
});
