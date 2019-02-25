/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import App from './cmd/app';
import AuthenticationProvider from './auth';
import OpenIDConnectProvider from './auth/oidc';
import Routes from './web/routes';
import WebServer from './web/webserver';
import { SessionOptions } from './auth/session';

async function main(cmd, options) {
  const opts = typeof cmd === 'string' ? options : cmd;

  try {
    await mongoose.connect(opts.databaseUrl, { useCreateIndex: true, useNewUrlParser: true });
  } catch (error) {
    throw new Error(`could not connect with MongoDB instances: ${error}`);
  }

  const authenticationProvider = opts.authenticationMethod === 'oidc'
    ? await OpenIDConnectProvider.parseFromCommand(opts)
    : null;

  if (authenticationProvider == null) throw new Error('authentication method not available');

  AuthenticationProvider.set(authenticationProvider);

  const { sessionExpiration, sessionSecret } = opts;

  SessionOptions.set(new SessionOptions(sessionSecret, sessionExpiration));

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
