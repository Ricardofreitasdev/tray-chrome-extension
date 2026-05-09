# Tray Chrome extension

Extensão do chrome com recursos que facilitam o trabalho com lojas Tray.

## Uso

Para usar a versão simples no seu navegador, basta seguir as orientações:

Click em `code` > `download ZIP`

![step1](./doc/step-1.png)

Descompacte o ZIP na sua pasta de preferência

Acesse `chrome://extensions/` com o modo do `desenvolvedor` ativo, click em `carregar sem compactação`, localize a pasta descompactada e click em `selecionar`

Com Isso a extensão já irá carregar

<img width="330" height="555" alt="image" src="https://github.com/user-attachments/assets/733b6f33-3453-4c45-9262-3d8d7534a55a" />

<img width="330" height="555" alt="image" src="https://github.com/user-attachments/assets/86d3e152-9d66-45a9-8b58-752e3021ced4" />

## Atualizações

A extensão agora pode consultar uma `version.json` hospedada no GitHub Pages e avisar no popup quando existir uma nova versão publicada.

Fluxo recomendado:

- publicar uma tag no formato `v1.0.5`
- o GitHub Actions gera o build e cria o arquivo `tray-chrome-extension.zip`
- o GitHub Release vira a origem do download
- o GitHub Pages publica a página de instalação e o `version.json`

Links esperados:

- Página de download: `https://ricardofreitasdev.github.io/Tray-chrome-extension/`
- Endpoint de versão: `https://ricardofreitasdev.github.io/Tray-chrome-extension/version.json`
- Última release: `https://github.com/Ricardofreitasdev/Tray-chrome-extension/releases/latest`

Observação: por limitação do Chrome, a extensão não é atualizada silenciosamente quando instalada como `carregar sem compactação`. O fluxo implementado avisa que existe uma nova versão e aponta para o download correto.

## Recursos

Aba Loja

Dados da loja

- ID da loja
- ID da sessão
- Código do GTM
- Código do GA4
- Código do Pixel do Facebook

Úteis

- Remover Tema
- Remover Scripts Externos
- Report de scripts inlines bloqueados por CSP

Histórico de uso da extensão

- Histórico das últimas 4 lojas visitadas.

Aba Ferramentas

- Gerar CPF com um click
- Limpar localStorage
- Whats My Dns
- Pagespeed
- Search Console
- Sitemap
- Robots
- Tag Assistant
- Documentação de APIs
- Documentação de Temas

## Desenvolvimento

Clone o repositório

```sh
git clone https://github.com/Ricardofreitasdev/Tray-chrome-extension.git
```

Entre na pasta do projeto

```sh
cd Tray-chrome-extension
```

Instale as dependencias

```sh
yarn install
```

Execute a aplicação

```sh
yarn dev
```

Após desenvolvimento faça o build

```sh
yarn build
```

Gerar o pacote instalável:

```sh
yarn package
```

Gerar os arquivos do GitHub Pages localmente:

```sh
yarn pages:build
```
