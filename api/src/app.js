import { Command } from 'commander';

class App extends Command {
  constructor() {
    super();

    const version = process.env.npm_package_version;
    this.version(version, '--version')
      .option('--database-url <string>', 'MongoDB connection URL. env: GCRYPT_DATABASE_URL')
      .option('--tls-certificate [path]', 'certificate file. env: GCRYPT_TLS_CERTIFICATE')
      .option('--tls-key [path]', 'key file. env: GCRYPT_TLS_KEY')
      .option('--webserver-address [string]', 'address where the web server listen for connections. env: GCRYPT_WEBSERVER_ADDRESS', '127.0.0.1:8888');
  }

  parse(args) {
    const append = (key, value) => args.indexOf(key) === -1
      && value != null && args.push(key, value);

    append('--database-url', process.env.GCRYPT_DATABASE_URL);
    append('--tls-certificate', process.env.GCRYPT_TLS_CERTIFICATE);
    append('--tls-key', process.env.GCRYPT_TLS_KEY);
    append('--webserver-address', process.env.GCRYPT_WEBSERVER_ADDRESS);

    super.parse(args);
  }
}

export default App;
