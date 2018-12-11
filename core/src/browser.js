/* eslint-disable func-names */
/* eslint new-cap: ["error", { "newIsCap": false }] */

/**
 * Create a new instance of session's storage compatible with browsers.
 *
 * @constructor
 * @param {string} [key=_gcrypt_token] - The used to hold session token.
 * @param {Storage} [storage=window.localStorage] - The location where data is
 * stored.
 */
function BrowserSessionStorage(key, storage) {
  this.key = key != null ? key : '_gcrypt_token';
  this.storage = storage != null ? storage : window.localStorage;
}

/**
 * Deletes any token mapped.
 *
 * @method
 */
BrowserSessionStorage.prototype.clear = function () {
  this.storage.removeItem(this.key);
};

/**
 * Retrieves a session token from browser strorage. When there is no token,
 * returns null value.
 *
 * @method
 * @returns {string?} The session token.
 */
BrowserSessionStorage.prototype.retrieve = function () {
  return this.storage.getItem(this.key);
};

/**
 * Saves the session token into browser's storage, overwrites older token.
 *
 * @method
 * @param {string!} token - The user's session token.
 */
BrowserSessionStorage.prototype.save = function (token) {
  this.storage.setItem(this.key, token);
};

/**
 * @typedef BrowserClientSettings
 * @type {object}
 * @property {any?} fetch - Implementation of Fetch API.
 * @property {BrowserSessionStorage?} sessionStorage - A session storage
 * compatible with browser.
 */

/**
 * Creates a client instance of GCrypt.
 *
 * @constructor
 * @param {string!} target An URL formatted string.
 * @param {BrowserClientSettings?} settings Additional settings about client.
 */
function BrowserClient(target, settings) {
  if (target == null) {
    throw new Error('target address is required');
  }

  if (typeof target !== 'string') {
    throw new Error('target address should be a string');
  }

  this.target = target;

  const newSettings = settings != null ? settings : {};

  this.fetch = newSettings.fetch != null
    ? newSettings.fetch : window.fetch;

  this.sessionStorage = newSettings.sessionStorage != null
    ? newSettings.sessionStorage : new BrowserSessionStorage();
}

/**
 * Checks whether the remote server is working or not.
 *
 * @async
 * @method
 * @returns {Promise<boolean>} A promise of a boolean value related to the
 * server status.
 */
BrowserClient.prototype.health = function () {
  return this.fetch(new Request(`${this.target}/health`))
    .then(response => response.ok);
};

/**
 * @typedef Credential Represents a general crendetial from user.
 * @type {NativeCredential}
 */

/**
 * @typedef NativeCredential Represents a traditional credential from a user.
 *
 * @type {object}
 * @property {string} username - The user's identifier (e.g. email).
 * @property {string} password - The user's password.
 * @property {string?} token - The user's Two factor token.
 */

/**
 * Attempts sign-in on remote server. If successful, returns a valid JWT string
 * for usage against authenticated endpoint on server.
 *
 * @async
 * @method
 * @param {Credential!} credential - The user's credential.
 * @return {Promise<string>} A valid for future use JavaScript Web Token.
 */
BrowserClient.prototype.login = function (credential) {
  if (credential == null) throw new Error('credential is required');

  const payload = {
    username: credential.username,
    password: credential.password,
  };

  if (credential.token != null) payload.token = credential.token;

  const request = new Request(`${this.target}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return this.fetch(request).then(response => (response.ok
    ? response.json()
    : response.text().then(message => Promise.reject(new Error(message)))))
    .then(json => (json.token != null
      ? json.token
      : Promise.reject(new Error('unexpected message received from remote server'))))
    .then((token) => {
      this.sessionStorage.save(token);
      return token;
    });
};

export { BrowserClient, BrowserSessionStorage };
