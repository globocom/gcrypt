import fs from 'fs';
import http from 'http';
import https from 'https';
import pem from 'pem';
import tmp from 'tmp';

import WebServer from './webserver';

describe('WebServer', () => {
  let webserver = null;
  let certificateTmpFile = null;
  let keyTmpFile = null;

  beforeAll(async () => {
    certificateTmpFile = tmp.fileSync({ prefix: 'gcrypt-api-certificate', postfix: '.pem' });
    keyTmpFile = tmp.fileSync({ prefix: 'gcrypt-api-key', postfix: '.pem' });

    const keys = await new Promise((resolve, reject) => {
      pem.createCertificate({ days: 1, selfSigned: true }, (err, result) => {
        if (err != null) reject(err);
        resolve(result);
      });
    });

    fs.writeFileSync(certificateTmpFile.name, keys.certificate);
    fs.writeFileSync(keyTmpFile.name, keys.serviceKey);

    webserver = new WebServer((_, response) => {
      response.writeHead(200);
      response.end('hello world\r\n');
    });
  });

  afterAll(() => {
    certificateTmpFile.removeCallback();
    keyTmpFile.removeCallback();
  });

  describe('#constructor', () => {
    it('When no certificate or private key are defined, should instanciate a HTTP server', () => {
      expect(webserver).toHaveProperty('server');
      expect(webserver.server).toBeInstanceOf(http.Server);
    });

    it('When certificate and private key options are defined, should instanciate a HTTPS server', async () => {
      const options = {
        certificate: certificateTmpFile.name,
        key: keyTmpFile.name,
      };

      const server = new WebServer(() => {}, options);
      expect(server).toHaveProperty('server');
      expect(server.server).toBeInstanceOf(https.Server);
    });
  });

  describe('#listen', () => {
    it('When then server is started correctly, should return an expected HTTP response', async () => {
      await webserver.listen();

      const { address, port } = webserver.options;

      const body = await new Promise((resolve, reject) => {
        http.get(`http://${address}:${port}/`, (response) => {
          let data = '';
          response.on('data', (chunk) => { data += chunk; });
          response.on('end', () => resolve(data));
        }).on('error', reject);
      });

      expect(body).toEqual('hello world\r\n');
      await webserver.server.close();
    });

    it('When the server cannot listen due to an error, should reject with the error related', async () => {
      await webserver.listen();
      const webserver2 = new WebServer();
      await expect(webserver2.listen()).rejects.toThrow();
      await webserver.server.close();
    });
  });

  describe('#close', () => {
    it('When the server is started correctly, should shutdown the server as expected', async () => {
      await webserver.listen();
      await webserver.close();
      const { address, port } = webserver.options;
      await expect(new Promise((_, reject) => http.get(`http://${address}:${port}/`, () => {}).on('error', reject)))
        .rejects.toThrow();
    });

    it('When the server is not listening, should reject with error related', async () => {
      await expect(webserver.close()).rejects.toThrow();
    });
  });
});
