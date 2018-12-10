import BrowserClient from '../browser';

describe('BrowserClient', () => {
  let client = null;

  beforeEach(() => {
    fetch.resetMocks();
    client = new BrowserClient('https://api.gcrypt.local:8443', { fetch });
  });

  describe('constructor', () => {
    it('When target is not defined, should throw error', () => {
      expect(() => new BrowserClient()).toThrowError('target address is required');
    });

    it('When target is not a string, should throw error', () => {
      expect(() => new BrowserClient(['not', 'string'])).toThrowError('target address should be a string');
    });

    it('When setting is not defined, should use default settings', () => {
      const newClient = new BrowserClient('https://api.gcrypt.local:8443');
      expect(newClient.fetch).toBe(window.fetch);
    });
  });

  describe('health', () => {
    it('When server is working, should resolve to true', () => {
      fetch.once('WORKING');

      return client.health().then((working) => {
        expect(fetch).toHaveBeenCalled();
        const request = fetch.mock.calls[0][0];
        expect(request.method).toStrictEqual('GET');
        expect(new URL(request.url).pathname).toStrictEqual('/health');
        return expect(working).toEqual(true);
      });
    });

    it('When server is not working, should resolve to false', () => {
      fetch.once('DOWN', { status: 500 });
      return expect(client.health()).resolves.toEqual(false);
    });
  });
});
