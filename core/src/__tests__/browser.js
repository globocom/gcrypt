import { BrowserClient, BrowserSessionStorage } from '../browser';

describe('BrowserClient', () => {
  let client = null;

  beforeEach(() => {
    fetch.resetMocks();
    client = new BrowserClient('https://api.gcrypt.local:8443', { fetch });
    client.sessionStorage.clear();
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

    it('When using a custom session storage, should use that instead default', () => {
      const sessionStorage = new BrowserSessionStorage('another-session-key');
      const newClient = new BrowserClient('https://api.gcrypt.local:8443', { sessionStorage });
      expect(newClient.sessionStorage).toEqual(sessionStorage);
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

  describe('login', () => {
    it('When credential is not defined, should throw error', () => {
      expect(() => client.login()).toThrowError('credential is required');
    });

    it('When credential is null, should throw error', () => {
      expect(() => client.login(null)).toThrowError('credential is required');
    });

    describe('NativeCredential', () => {
      it('When the token field is not defined, should omit it on body request', () => {
        fetch.once(JSON.stringify({ token: '...' }));

        const credential = {
          username: 'gcrypt@gcrypt.globo.com',
          password: 'awesome-security-testing',
        };

        return client.login(credential).then(() => {
          expect(fetch).toHaveBeenCalled();
          const request = fetch.mock.calls[0][0];
          expect(request.method).toStrictEqual('POST');
          expect(request.headers.get('Content-Type')).toContain('application/json');
          expect(new URL(request.url).pathname).toStrictEqual('/auth/login');
          return expect(request.json()).resolves.toStrictEqual(credential);
        });
      });

      it('When token is defined, should return expected body data', () => {
        fetch.once(JSON.stringify({ token: '...' }));

        const credential = {
          username: 'gcrypt@gcrypt.globo.com',
          password: 'awesome-security-testing',
          token: '312456',
        };

        return client.login(credential).then(() => {
          expect(fetch).toHaveBeenCalled();
          const request = fetch.mock.calls[0][0];
          expect(request.method).toStrictEqual('POST');
          expect(request.headers.get('Content-Type')).toContain('application/json');
          expect(new URL(request.url).pathname).toStrictEqual('/auth/login');
          return expect(request.json()).resolves.toStrictEqual(credential);
        });
      });

      it('When login is unsuccessful, should reject with servers response', () => {
        const errorMessage = 'Wrong credential';
        fetch.once(errorMessage, { status: 401 });

        const credential = {
          username: 'gcrypt@gcrypt.globo.com',
          password: 'awesome-security-testing',
          token: '312456',
        };

        return expect(client.login(credential)).rejects.toThrowError(errorMessage);
      });

      it('When login is successful but the JSON has no token field, should reject', () => {
        fetch.once('{}');

        const credential = {
          username: 'gcrypt@gcrypt.globo.com',
          password: 'awesome-security-testing',
          token: '312456',
        };

        return expect(client.login(credential))
          .rejects.toThrowError('unexpected message received from remote server');
      });

      it('When login is successful, should store the token in web storage', () => {
        const serverResponse = {
          token: 'just another jwt',
        };

        fetch.once(JSON.stringify(serverResponse));

        const credential = {
          username: 'gcrypt@gcrypt.globo.com',
          password: 'awesome-security-testing',
          token: '312456',
        };

        return client.login(credential).then(token => expect(client.sessionStorage.retrieve())
          .toStrictEqual(token));
      });
    });
  });

  describe('logout', () => {
    it('When has no session active, should reject and return an expected error', () => {
      expect(client.logout()).rejects.toThrowError('there is no session active currently');
    });

    it('When logout is successful, should clear the session storage', () => {
      fetch.once('OK');

      const token = 'another-jwt-token';
      client.sessionStorage.save(token);

      return client.logout().then((loggedOut) => {
        expect(loggedOut).toStrictEqual(true);

        expect(fetch).toHaveBeenCalled();
        const request = fetch.mock.calls[0][0];
        expect(request.method).toStrictEqual('POST');
        expect(new URL(request.url).pathname)
          .toStrictEqual('/auth/logout');
        expect(request.headers.get('Authorization'))
          .toStrictEqual(`Bearer ${token}`);

        return expect(client.sessionStorage.retrieve()).toStrictEqual(null);
      });
    });

    it('When logout is unsuccessful, should keep the token into browser storage', () => {
      fetch.once('bad gateway', { status: 502 });

      const token = 'another-jwt-token';
      client.sessionStorage.save(token);

      return client.logout().then((loggedOut) => {
        expect(loggedOut).toStrictEqual(false);
        return expect(client.sessionStorage.retrieve())
          .toStrictEqual(token);
      });
    });
  });
});

describe('BrowserSessionStorage', () => {
  const clearStorage = (storage) => {
    Array.from(Array(storage.length).keys())
      .forEach(index => storage.removeItem(storage.key(index)));
  };

  const clearAllStorages = () => {
    clearStorage(window.localStorage);
    clearStorage(window.sessionStorage);
  };

  beforeEach(clearAllStorages);

  afterEach(clearAllStorages);

  describe('constructor', () => {
    it('When no one param is defined, should use default values', () => {
      const sessionStorage = new BrowserSessionStorage();
      expect(sessionStorage.key).toStrictEqual('_gcrypt_token');
      expect(sessionStorage.storage).toBe(window.localStorage);
    });

    it('When using custom settings, should ensure expected field on instance', () => {
      const key = 'another-session-key';
      const storage = window.sessionStorage;
      const sessionStorage = new BrowserSessionStorage(key, storage);
      expect(sessionStorage.key).toStrictEqual(key);
      expect(sessionStorage.storage).toStrictEqual(storage);
    });
  });

  describe('clear', () => {
    it('When cleaning the key in storage, ensure it was deleted', () => {
      const token = 'awesome-gcrypt-token';
      const storage = window.sessionStorage;
      const sessionStorage = new BrowserSessionStorage(null, storage);
      storage.setItem(sessionStorage.key, token);
      expect(sessionStorage.storage.getItem(sessionStorage.key)).toEqual(token);
      sessionStorage.clear();
      expect(sessionStorage.storage.getItem(sessionStorage.key)).toEqual(null);
    });
  });

  describe('retrieve', () => {
    it('When storage is empty, should return null value', () => {
      const storage = new BrowserSessionStorage();
      expect(storage.retrieve()).toEqual(null);
    });

    it('When storage is not empty, should return expected token', () => {
      const token = 'awesome-gcrypt-token';
      const storage = new BrowserSessionStorage();
      storage.storage.setItem(storage.key, token);
      expect(storage.retrieve()).toStrictEqual(token);
    });
  });

  describe('save', () => {
    it('When saving a token, ensure it really was stored', () => {
      const token = 'awesome-gcrypt-token';
      const storage = new BrowserSessionStorage();
      storage.save(token);
      expect(storage.storage.getItem(storage.key)).toStrictEqual(token);
    });
  });
});
