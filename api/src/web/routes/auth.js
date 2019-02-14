/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import { Router } from 'express';

import AuthenticationProvider from '../../auth';
import OpenIDConnectProvider from '../../auth/oidc';

const router = new Router();

router.get('/scheme', (request, response) => {
  const provider = AuthenticationProvider.get();

  if (provider instanceof OpenIDConnectProvider) {
    return response.send({
      name: 'oidc',
      data: { authorizationURL: provider.authorizationURL },
    });
  }

  response.send(500);
});

router.get('/callback', async (request, response) => {
  const provider = AuthenticationProvider.get();

  if (provider instanceof OpenIDConnectProvider) {
    const token = await provider.authorizationCallback(request.url);
    return response.send(token);
  }

  response.send(500);
});

export default router;
