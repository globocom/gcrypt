/* eslint-disable func-names */
/* eslint new-cap: ["error", { "newIsCap": false }] */

/**
 * @typedef BrowserClientSettings
 * @type {object}
 * @property {any} fetch - Implementation of Fetch API.
 */

/**
 * Creates a client instance of GCrypt.
 *
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

  this.fetch = newSettings.fetch != null ? newSettings.fetch : window.fetch;
}

/**
 * Checks whether the remote server is working or not.
 *
 * @async
 * @function health
 * @returns {Promise<boolean>} A promise of a boolean value related to the
 * server status.
 */
BrowserClient.prototype.health = function () {
  return this.fetch(new Request(`${this.target}/health`))
    .then(response => response.ok);
};

export default BrowserClient;
