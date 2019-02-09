import App from './app';

describe('App', () => {
  const originalEnvs = Object.assign({}, process.env);

  beforeEach(() => {
    process.env = Object.assign({}, originalEnvs);
  });

  describe('#parse', () => {
    let app = null;

    beforeEach(() => {
      process.env.GCRYPT_DATABASE_URL = 'mongodb://localhost:27017/gcrypt';
      process.env.GCRYPT_TLS_CERTIFICATE = '/path/to/certificate.pem';
      process.env.GCRYPT_TLS_KEY = '/path/to/key.pem';
      process.env.GCRYPT_WEBSERVER_ADDRESS = '0.0.0.0:8080';

      app = new App();
    });

    it('When parameters are defined by environment vars, should parse options as expected', () => {
      app.parse(['node', './app.js']);

      expect(app.databaseUrl).toEqual(process.env.GCRYPT_DATABASE_URL);
      expect(app.tlsCertificate).toEqual(process.env.GCRYPT_TLS_CERTIFICATE);
      expect(app.tlsKey).toEqual(process.env.GCRYPT_TLS_KEY);
      expect(app.webserverAddress).toEqual(process.env.GCRYPT_WEBSERVER_ADDRESS);
    });

    it('When both environment vars and CLI arguments are defined, should prefer the last one', () => {
      const expected = 'mongodb://db.example.com:27017/gcrypt';
      const args = ['node', './app.js', '--database-url', expected];

      app.parse(args);

      expect(app.databaseUrl).toEqual(expected);
    });
  });
});
