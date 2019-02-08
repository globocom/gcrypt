/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

let providerInstance = null;

class AuthenticationProvider {
  static get() {
    return providerInstance;
  }

  static set(provider) {
    providerInstance = provider;
  }
}

export default AuthenticationProvider;
