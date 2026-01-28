# POC Webhook Zenvia

Um projeto básico em Node.js utilizando o framework Express.

## Pré-requisitos

- Node.js (v14+)
- npm ou yarn

## Instalação

1. Clone o repositório ou navegue até a pasta do projeto
2. Instale as dependências:

```bash
npm install
```

## Executando o Projeto

### Modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`

## Rotas Disponíveis

- **GET** `/` - Mensagem de boas-vindo
- **GET** `/api/health` - Status de saúde da aplicação
- **POST** `/api/echo` - Echo das dados enviados no corpo da requisição

## Estrutura do Projeto

```
poc-webhook-zenvia/
├── src/
│   └── index.js          # Arquivo principal da aplicação
├── package.json          # Dependências do projeto
├── .gitignore           # Arquivos ignorados pelo git
└── README.md            # Este arquivo
```

## Dependências

- **express**: Framework web para Node.js
- **nodemon**: (dev) Ferramenta para auto-reload durante desenvolvimento

## Desenvolvendo

Para adicionar novas rotas, edite o arquivo `src/index.js` e adicione seus endpoints.
