/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import jwt from 'jsonwebtoken';

let sessionOptionsInstance = null;

class SessionOptions {
  constructor(secret, expiration, algorithm = 'HS384') {
    this.secret = secret;
    this.expiration = expiration;
    this.algorithm = algorithm;
  }

  static set(sessionOptions) {
    sessionOptionsInstance = sessionOptions;
  }

  static get() {
    return sessionOptionsInstance;
  }
}

class SessionToken {
  static sign(data) {
    const options = SessionOptions.get();
    return new Promise((resolve, reject) => {
      const { algorithm, expiration, secret } = options;
      jwt.sign(data, secret, { algorithm, expiresIn: expiration }, (error, token) => {
        return error != null ? reject(error) : resolve(token);
      });
    });
  }
}

export { SessionOptions, SessionToken };
