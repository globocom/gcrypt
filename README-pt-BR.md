<img src="images/gcrypt-logo.png" align="right" height="35" />

# GCrypt [![Build Status](https://travis-ci.org/globocom/gcrypt.svg?branch=master)](https://travis-ci.org/globocom/gcrypt)

GCrypt é uma ferramenta de código aberto que ajuda as organizações a mitigar a exposição de dados confidenciais em arquivos, fornecendo um aplicativo Web amigável para criptografar/descriptografar estes.

## Como funciona?

Gcrypt tem uma interface web onde o usuário se autentica. Após a autenticação do usuário, o usuário seleciona um arquivo e quais usuários e grupos devem ter acesso a ele. Com estas informações, a API gcrypt envia uma chave para o navegador. Com essa chave, o navegador criptografa o arquivo e oferece ao usuário o download.

Este arquivo é criptografado usando criptografia simétrica e pode ser enviado por email, por exemplo. Quando o destinatário recebe este arquivo, ele entra na interface gcrypt e, ao arrastar, recebe o mesmo arquivo descriptografado (nos bastidores, a API grypt verifica as permissões e envia a chave ao navegador do destinatário).

## Rodando localmente


## Criptografando um novo arquivo:

## Descriptografando um novo arquivo:

## Contribuição

Para contribuir, abra uma issue ou um MR com o status 'work in progress' (WIP).

## Documentação

Veja nossa [wiki](https://github.com/globocom/gcrypt/wiki).

## Licença

Este projeto está licenciado sob a licença MIT - leia o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

*Este artigo foi traduzido do [Inglês](README.md) para [Português (Brasil)](README-pt-BR.md).*
