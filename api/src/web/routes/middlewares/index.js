/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import Token from '../../../db/model/token';
import { SessionToken } from '../../../auth/session';

async function tokenAuthentication(request, response, next) {
  const unauthorizedResponse = () => response
    .type('text/plain')
    .set('WWW-Authenticate', 'Bearer')
    .status(401)
    .send('Authentication token is missing or invalid');

  const { authorization } = request.headers;

  if (authorization == null) {
    return unauthorizedResponse();
  }

  const [type, token] = authorization.split(' ');

  if (type == null || type.toLowerCase() !== 'bearer' || token == null) {
    return unauthorizedResponse();
  }

  try {
    const { jti } = await SessionToken.verify(token);
    const dbToken = await Token.findByJTI(jti);

    if (dbToken == null || dbToken.isRevoked()) {
      return unauthorizedResponse();
    }

    request.jti = jti;
    request.token = token;
  } catch (error) {
    console.error(error);
    return unauthorizedResponse();
  }

  return next();
}

/* eslint-disable import/prefer-default-export */
export { tokenAuthentication };
