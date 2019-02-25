/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import express from 'express';
import morgan from 'morgan';
import nocache from 'nocache';

import authRouter from './auth';

export default (() => {
  const app = express();

  app.disable('x-powered-by');
  app.use(nocache());
  app.use(morgan('short'));

  morgan.token('remote-user', request => request.jti || 'anonymous');

  app.use('/auth', authRouter);

  app.get('/health', (request, response) => {
    response.send('OK');
  });

  return app;
})();
