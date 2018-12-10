/* eslint new-cap: ["error", { "newIsCap": false }] */

/**
 * @typedef BrowserClientSettings
 * @type {object}
 * @property {Window.storage} storage - Storage for holds the session token.
 * @property {string} sessionkey - A string.
 */

/**
 * Creates a browser instance of GCrypt's client.
 *
 * @param {string} target An URL formatted string.
 * @param {BrowserClientSettings} settings Additional settings about client.
 */
function BrowserClient(target, settings) {
  this.target = target;

  this.settings = settings != null ? settings : {
    storage: window.localStorage,
    key: 'gcrypt-token',

    fetch: window.fetch,
  };
}

/**
 * Checks whether the remote server is working or not. If successful returns.
 */
BrowserClient.prototype.health = () => {
  const request = new Request(`${this.address}/health`);

  return this.settings.fetch(request);
};

export default BrowserClient;
