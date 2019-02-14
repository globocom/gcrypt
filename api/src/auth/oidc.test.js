import querystring from 'querystring';
import nock from 'nock';
import { Issuer } from 'openid-client';

import OpenIDConnectProvider from './oidc';

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
    it('When invoked with OP parameters in query string, should call the exepcted methods with expected params', async () => {
      const code = 'example-code';
      const session_state = 'example-state';
      const state = session_state;
      const scopes = 'openid';
      const redirectURL = 'https://api.gcrypt.globoi.com/auth/callback';
      const url = `${redirectURL}?session_state=${session_state}&code=${code}`;

      const callbackParams = jest.fn()
        .mockReturnValue({ code, session_state });

      const authorizationCallback = jest.fn();

      const client = jest.fn()
        .mockImplementation(() => ({ authorizationCallback, callbackParams }));

      const provider = new OpenIDConnectProvider(new client(), { scopes, redirectURL });
      await provider.authorizationCallback(url);

      expect(provider.client.callbackParams)
        .toBeCalledWith(url);

      expect(provider.client.authorizationCallback)
        .toBeCalledWith(redirectURL, { code, session_state, state }, { response_type: 'code', state });
   });
  });
});
