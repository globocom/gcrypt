import querystring from 'querystring';
import nock from 'nock';

import OpenIDConnectProvider from './oidc';
import { SessionToken } from './session';

describe('OpenIDConnectProvider', () => {
  describe('#parseFromCommand', () => {
    it('When authentication method is not "oidc", should reject with error related', async () => {
      const command = { authenticationMethod: 'another-method' };
      await expect(OpenIDConnectProvider.parseFromCommand(command)).rejects.toThrow();
    });

    it('When authenticated parameters, should resolve with a new instance of OpenIDConnectProvider', async () => {
      const command = {
        authenticationMethod: 'oidc',
        authenticationOidcUrl: 'https://oidc.example.com/auth/realms/myrealm',
        authenticationOidcClientId: 'example-client-id',
        authenticationOidcClientSecret: 'my client secret',
        authenticationOidcScopes: 'openid email',
        authenticationOidcRedirectUrl: 'https://api.gcrypt.example.com/auth/callback',
      };

      const authorizationURL = `${command.authenticationOidcUrl}/protocol/openid-connect/auth`;

      nock('https://oidc.example.com')
        .get('/auth/realms/myrealm/.well-known/openid-configuration')
        .reply(200, { authorization_endpoint: authorizationURL });

      const provider = await OpenIDConnectProvider.parseFromCommand(command);

      expect(provider).toHaveProperty('client');
      expect(provider).toHaveProperty('authorizationURL', `${authorizationURL}?client_id=${command.authenticationOidcClientId}&scope=${querystring.escape(command.authenticationOidcScopes)}&response_type=code&redirect_uri=${querystring.escape(command.authenticationOidcRedirectUrl)}`);
    });
  });

  describe('#authorizationCallback', () => {
    const
      code = 'example-code',
      session_state = 'example-state',
      scopes = 'openid email',
      state = session_state,
      redirectURL = 'https://api.gcrypt.example.com/auth/callback',
      url = `${redirectURL}?session_state=${session_state}&code=${code}`,
      userInfo = { name: 'example', email: 'example@example.com', jti: 'example-jti' },
      token = 'example-jwt',
      claims = { exp: 1551044090, iat: 1551044090, ...userInfo };

    beforeEach(() => {
      SessionToken.sign = jest.fn()
        .mockResolvedValue(token);

      SessionToken.verify = jest.fn()
        .mockResolvedValue(claims);
    });

    it('When invoked with OP parameters in query string, should call the exepcted methods with expected params', async () => {
      const callbackParams = jest.fn()
        .mockReturnValue({ code, session_state });

      const authorizationCallback = jest.fn()
        .mockResolvedValue({ claims: userInfo });

      const Client = jest.fn()
        .mockImplementation(() => ({ authorizationCallback, callbackParams }));

      const provider = new OpenIDConnectProvider(new Client(), { scopes, redirectURL });
      const result = await provider.authorizationCallback(url);

      expect(provider.client.callbackParams)
        .toBeCalledWith(url);

      expect(provider.client.authorizationCallback)
        .toBeCalledWith(redirectURL, { code, session_state, state }, { response_type: 'code', state });

      expect(SessionToken.sign)
        .toBeCalledWith(userInfo);

      expect(SessionToken.verify)
        .toBeCalledWith(token);

      expect(result).toEqual({ claims, token });
    });

    it('When the authorizationCallback method of the OIDC provider is rejected, should thrown an error', () => {
      const callbackParams = jest.fn()
        .mockReturnValue({ code, session_state });

      const authorizationCallback = jest.fn()
        .mockRejectedValue(new Error('the provided code is invalid'));

      const Client = jest.fn()
        .mockImplementation(() => ({ authorizationCallback, callbackParams }));

      const provider = new OpenIDConnectProvider(new Client(), { scopes, redirectURL });
      expect(provider.authorizationCallback(url)).rejects.toThrow();
    });
  });
});
