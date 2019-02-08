/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import { Command } from 'commander';

class App extends Command {
  constructor() {
    super();

    const version = process.env.npm_package_version;
    this.version(version, '--version')
      .description('Starts the GCrypt API')
      .option('--authentication-method [string]', 'authentication method name. env: GCRYPT_AUTHENTICATION_METHOD', 'oidc')
      .option('--authentication-oidc-url [string]', 'OpenID Connect discover URL. env: GCRYPT_AUTHENTICATION_OIDC_URL')
      .option('--authentication-oidc-client-id [string]', 'OpenID Connect client ID. env: GCRYPT_AUTHENTICATION_OIDC_CLIENT_ID')
      .option('--authentication-oidc-client-secret [string]', 'OpenID Connect client secret. env: GCRYPT_AUTHENTICATION_OIDC_CLIENT_SECRET')
      .option('--authentication-oidc-redirect-url [string]', 'OpenID Connect redirect URL. env: GCRYPT_AUTHENTICATION_OIDC_REDIRECT_URL')
      .option('--authentication-oidc-scopes [string]', 'OpenID Connect scopes. env: GCRYPT_AUTHENTICATION_OIDC_SCOPES', 'openid email')
      .option('--database-url <string>', 'MongoDB connection URL. env: GCRYPT_DATABASE_URL')
      .option('--tls-certificate [path]', 'certificate file. env: GCRYPT_TLS_CERTIFICATE')
      .option('--tls-key [path]', 'key file. env: GCRYPT_TLS_KEY')
      .option('--webserver-address [string]', 'address where the web server listen for connections. env: GCRYPT_WEBSERVER_ADDRESS', '127.0.0.1:8888');
  }

  parse(args) {
    const append = (key, value) => args.indexOf(key) === -1
      && value != null && args.push(key, value);

    append('--authentication-method', process.env.GCRYPT_AUTHENTICATION_METHOD);
    append('--authentication-oidc-url', process.env.GCRYPT_AUTHENTICATION_OIDC_URL);
    append('--authentication-oidc-client-id', process.env.GCRYPT_AUTHENTICATION_OIDC_CLIENT_ID);
    append('--authentication-oidc-client-secret', process.env.GCRYPT_AUTHENTICATION_OIDC_CLIENT_SECRET);
    append('--authentication-oidc-scopes', process.env.GCRYPT_AUTHENTICATION_OIDC_SCOPES);
    append('--authentication-oidc-redirect-url', process.env.GCRYPT_AUTHENTICATION_OIDC_REDIRECT_URL);
    append('--database-url', process.env.GCRYPT_DATABASE_URL);
    append('--tls-certificate', process.env.GCRYPT_TLS_CERTIFICATE);
    append('--tls-key', process.env.GCRYPT_TLS_KEY);
    append('--webserver-address', process.env.GCRYPT_WEBSERVER_ADDRESS);

    super.parse(args);
  }
}

export default App;
