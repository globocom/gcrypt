/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import { Router } from 'express';

import { tokenAuthentication } from './middlewares';

import AuthenticationProvider from '../../auth';
import OpenIDConnectProvider from '../../auth/oidc';
import Token from '../../db/model/token';

const router = new Router();

router.get('/scheme', (_, response) => {
  const provider = AuthenticationProvider.get();

  if (provider instanceof OpenIDConnectProvider) {
    return response.send({
      name: 'oidc',
      data: { authorizationURL: provider.authorizationURL },
    });
  }

  return response.sendStatus(500);
});

router.get('/callback', async (request, response) => {
  const provider = AuthenticationProvider.get();

  if (!(provider instanceof OpenIDConnectProvider)) {
    return response.sendStatus(500);
  }

  try {
    const { claims, token } = await provider.authorizationCallback(request.url);
    await Token.create(claims);
    return response.send({ token });
  } catch (error) {
    console.error(error);
    return response.sendStatus(500);
  }
});

router.delete('/logout', tokenAuthentication, async (request, response) => {
  const { jti } = request;

  try {
    const token = await Token.findByJTI(jti);
    await token.revoke();
    return response.sendStatus(204);
  } catch (error) {
    console.error(error);
    return response.sendStatus(500);
  }
});

export default router;
