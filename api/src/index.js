/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import dotenv from 'dotenv';

import App from './cmd/app';
import AuthenticationProvider from './auth';
import OpenIDConnectProvider from './auth/oidc';
import Routes from './web/routes';
import WebServer from './web/webserver';

async function main(cmd, options) {
  const opts = typeof cmd === 'string' ? options : cmd;

  const authenticationProvider = opts.authenticationMethod === 'oidc'
    ? await OpenIDConnectProvider.parseFromCommand(opts)
    : null;

  if (authenticationProvider == null) throw new Error('authentication method not available');

  AuthenticationProvider.set(authenticationProvider);

  const [address, port] = opts.webserverAddress.split(':');
  const certificate = opts.tlsCertificate;
  const key = opts.tlsKey;

  const webserverOptions = {
    address, port, certificate, key,
  };

  const webserver = new WebServer(Routes, webserverOptions);

  const shutdownWebServer = () => webserver.close();

  process.on('SIGINT', shutdownWebServer);
  process.on('SIGTERM', shutdownWebServer);

  webserver.listen();
}

dotenv.config();

new App()
  .action(main)
  .parse(process.argv);
