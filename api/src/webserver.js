import fs from 'fs';
import http from 'http';
import https from 'https';

class WebServer {
  constructor(listener, options) {
    const defaultOptions = {
      address: '127.0.0.1',
      port: 8888,
    };

    this.options = Object.assign(defaultOptions, options);

    if (this.options.certificate != null && this.options.key != null) {
      const cert = fs.readFileSync(this.options.certificate);
      const key = fs.readFileSync(this.options.key);
      this.server = https.createServer({ cert, key }, listener);
    } else {
      this.server = http.createServer(listener);
    }
  }

  listen() {
    return new Promise((resolve, reject) => {
      const { address, port } = this.options;

      this.server.once('listening', () => {
        console.log(`🚀  GCrypt API is listening at ${address}:${port}`);
        resolve();
      });

      this.server.once('error', (error) => {
        console.error('🔥  Could not launch GCrypt API');
        reject(error);
      });

      this.server.listen(port, address);
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error != null) reject(error);
        console.log('👋  GCrypt API is gracefully shutting down');
        resolve();
      });
    });
  }
}

export default WebServer;
