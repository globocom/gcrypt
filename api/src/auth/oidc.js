/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import { Issuer } from 'openid-client';

class OpenIDConnectProvider {
  constructor(client, { scopes, redirectURL }) {
    this.client = client;
    this.scopes = scopes;
    this.redirectURL = redirectURL;
  }

  get authorizationURL() {
    console.log(this.redirectURL);

    return this.client.authorizationUrl({
      redirect_uri: this.redirectURL,
      scope: this.scopes,
    });
  }

  static parseFromCommand(command) {
    return new Promise((resolve, reject) => {
      if (command.authenticationMethod !== 'oidc') {
        reject(new Error('could not create an OpenID Connect provider using a non "oidc" method'));
      }

      const url = command.authenticationOidcUrl;
      const clientID = command.authenticationOidcClientId;
      const clientSecret = command.authenticationOidcClientSecret;
      const scopes = command.authenticationOidcScopes;
      const redirectURL = command.authenticationOidcRedirectUrl;

      Issuer.discover(url)
        .then((issuer) => {
          const client = new issuer.Client({ client_id: clientID, client_secret: clientSecret });
          resolve(new OpenIDConnectProvider(client, { scopes, redirectURL }));
        })
        .catch(reject);
    });
  }
}

export default OpenIDConnectProvider;
