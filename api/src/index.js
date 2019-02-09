/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import dotenv from 'dotenv';

import Routes from './web/routes';
import App from './cmd/app';
import WebServer from './web/webserver';

function main(cmd, options) {
  const opts = typeof cmd === 'string' ? options : cmd;

  const [address, port] = opts.webserverAddress.split(':');
  const certificate = opts.tlsCertificate;
  const key = opts.tlsKey;

  const webserver = new WebServer(Routes, { address, port, certificate, key });

  const shutdownWebServer = () => webserver.close();
  
  process.on('SIGINT', shutdownWebServer);
  process.on('SIGTERM', shutdownWebServer);

  webserver.listen();
}

dotenv.config();

new App()
  .action(main)
  .parse(process.argv);
