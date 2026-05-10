# Tray Chrome extension

Extensão do chrome com recursos que facilitam o trabalho com lojas Tray.

## Uso

A instalação oficial da extensão passa pelo site:

- [Site Oficial](https://ricardofreitasdev.github.io/tray-chrome-extension/)

Abra esse link em uma nova aba para baixar a versão mais recente e seguir o fluxo de instalação.

Se você preferir instalar manualmente a partir do código-fonte, siga as orientações abaixo.

Click em `code` > `download ZIP`

![step1](./doc/step-1.png)

Descompacte o ZIP na sua pasta de preferência

Se você clonou o repositório em vez de baixar uma release, gere primeiro o build:

```sh
yarn install
yarn build
```

Acesse `chrome://extensions/` com o modo do `desenvolvedor` ativo, click em `carregar sem compactação`, localize a pasta descompactada e click em `selecionar`

Com Isso a extensão já irá carregar

<img width="330" height="555" alt="image" src="https://github.com/user-attachments/assets/733b6f33-3453-4c45-9262-3d8d7534a55a" />

<img width="330" height="555" alt="image" src="https://github.com/user-attachments/assets/86d3e152-9d66-45a9-8b58-752e3021ced4" />

## Atualizações

A extensão agora pode consultar uma `version.json` hospedada no GitHub Pages e avisar no popup quando existir uma nova versão publicada.

Fluxo recomendado:

- publicar uma tag no formato `v1.0.6` ou `1.0.6`
- o GitHub Actions gera o build e cria o arquivo `tray-chrome-extension.zip`
- o GitHub Release vira a origem do download
- o GitHub Pages publica a página de instalação e o `version.json`

Links esperados:

- Página de download: `https://ricardofreitasdev.github.io/tray-chrome-extension/`
- Endpoint de versão: `https://ricardofreitasdev.github.io/tray-chrome-extension/version.json`
- Última release: `https://github.com/Ricardofreitasdev/tray-chrome-extension/releases/latest`

Observação: por limitação do Chrome, a extensão não é atualizada silenciosamente quando instalada como `carregar sem compactação`. O fluxo implementado avisa que existe uma nova versão e aponta para o download correto.

## Recursos

### Aba Loja

Dados da loja:

- ID da loja
- ID da sessão
- Server
- Código do GTM
- Código do GA4
- Código do UA
- Código do Pixel do Facebook

Ações rápidas:

- Acessar painel da loja via configuração opcional de dashboard
- Ativar debug de conversões do Facebook
- Remover tema
- Remover scripts externos
- Report de scripts inline sem `nonce` em páginas com CSP
- Exportar relatório de scripts externos

Histórico:

- Histórico das últimas 4 lojas visitadas

### Aba Ferramentas

- Verificar atualizações da extensão
- Gerar CPF com um clique
- Capturar print da aba atual
- Whats My Dns
- PageSpeed
- Search Console
- Sitemap
- Robots
- Tag Assistant
- Documentação de APIs
- Documentação de temas

### Aba Clipboard

- Histórico das últimas cópias feitas no navegador
- Atalho `Alt + Shift + V` para capturar texto da página
- Clique em um item para copiar novamente
- Limpeza rápida do histórico salvo

### Aba Dev

- Troca rápida entre ambientes configurados para páginas de `checkout`
- Troca rápida entre ambientes configurados para páginas de `my-account`
- A aba só aparece quando existem ambientes configurados em `src/config.js`

## Desenvolvimento

Clone o repositório

```sh
git clone https://github.com/Ricardofreitasdev/tray-chrome-extension.git
```

Entre na pasta do projeto

```sh
cd tray-chrome-extension
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

Observação: a pasta `dist/` não precisa mais ficar versionada no repositório. Para carregar a extensão localmente após clonar, rode `yarn build` antes de abrir o `chrome://extensions`.

Gerar o pacote instalável:

```sh
yarn package
```

Gerar os arquivos do GitHub Pages localmente:

```sh
yarn pages:build
```
