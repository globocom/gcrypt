/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import express from 'express';
import morgan from 'morgan';
import nocache from 'nocache';

export default (() => {
  const app = express();

  app.disable('x-powered-by');
  app.use(nocache());
  app.use(morgan('tiny'));

  app.get('/health', (request, response) => {
    response.send('OK');
  });

  return app;
})();
