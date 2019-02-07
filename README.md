<img src="images/gcrypt-logo.png" align="right" height="35" />

# GCrypt [![Build Status](https://travis-ci.org/globocom/gcrypt.svg?branch=master)](https://travis-ci.org/globocom/gcrypt)

GCrypt is an open source tool that helps organizations mitigate sensitive data exposure in files by providing an user-friendly web application to encrypt/decrypt them.

## How does it work?

Gcrypt has a web interface where the user authenticates. After user authenticate, the user selects a file and which users and groups should have access to it. With this information, the gcrypt API sends a key to the browser. With this key, the browser encrypts the file and offers the user for download.

This file is encrypted using symmetric encryption and can be sent via email, for example. When the destination receives this file, it enters the gcrypt interface and dragging the file receives the same decrypted file (behind the scenes, the grypt API checks the permissions and sends the key to the recipient's browser).

## Running locally


## Encrypting a new file:

## Decrypting a new file:

## Contributing

To contribute, open an issue or an MR with 'work in progress' (WIP) status.

## Documentation

Check our [wiki](https://github.com/globocom/gcrypt/wiki).

## License

This project is licensed under the MIT License - read [LICENSE.md](LICENSE.md) file for details.
