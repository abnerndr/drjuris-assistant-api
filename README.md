<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# DrJuris Assistant API

API para análise de processos trabalhistas usando Inteligência Artificial, construída com NestJS, TypeORM e TypeScript.

## 🚀 Funcionalidades

- **Análise de Processos**: Analisa textos de processos trabalhistas usando IA
- **Upload de Arquivos**: Suporta upload de arquivos PDF, DOCX e TXT
- **Base de Conhecimento**: Utiliza conhecimento legal para análises mais precisas
- **Documentação Swagger**: API completamente documentada
- **Persistência de Dados**: Armazena análises no banco de dados SQLite
- **Validação**: Validação automática de entrada com class-validator

## 🛠️ Tecnologias

- **NestJS**: Framework Node.js para construção de aplicações escaláveis
- **TypeORM**: ORM para TypeScript e JavaScript
- **TypeScript**: Linguagem de programação tipada
- **Swagger**: Documentação automática da API
- **OpenAI GPT**: Modelo de IA para análise de texto
- **Google Gemini**: Modelo alternativo de IA
- **SQLite**: Banco de dados para desenvolvimento

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Chaves de API do OpenAI e/ou Google Gemini

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd drjuris-assistant-api
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

Edite o arquivo `.env` e adicione suas chaves de API:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Execute a aplicação:
```bash
# Desenvolvimento
pnpm run start:dev

# Produção
pnpm run build
pnpm run start:prod
```

## 📚 Endpoints da API

### Informações Gerais
- `GET /` - Informações sobre a API

### Análise de Processos
- `POST /analyze` - Analisa texto de processo trabalhista
- `POST /upload` - Upload e análise de arquivo (PDF, DOCX, TXT)

### Histórico
- `GET /processes` - Lista todos os processos analisados
- `GET /processes/:id` - Obtém processo específico por ID

## 📖 Documentação

A documentação completa da API está disponível em:
```
http://localhost:8000/api-docs
```

## 🔍 Exemplos de Uso

### Análise de Texto
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "process_text": "PROCESSO TRABALHISTA Nº 123/2024...",
    "instructions": "Foque na análise de prazos processuais"
  }'
```

### Upload de Arquivo
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@processo.pdf" \
  -F "instructions=Foque na análise de fundamentação"
```

## 🗄️ Banco de Dados

A aplicação utiliza SQLite por padrão para desenvolvimento. Para produção, você pode configurar outros bancos de dados editando a configuração do TypeORM no `app.module.ts`.

### Estrutura da Tabela
```sql
CREATE TABLE processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  processText TEXT NOT NULL,
  analysis JSON,
  additionalInstructions TEXT,
  originalFileName VARCHAR(255),
  fileExtension VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta da aplicação | `8000` |
| `MAX_TEXT_LENGTH` | Tamanho máximo do texto para análise | `6000` |
| `OPENAI_API_KEY` | Chave da API OpenAI | - |
| `GEMINI_API_KEY` | Chave da API Google Gemini | - |

### Configuração do Banco de Dados

Para usar outros bancos de dados, modifique a configuração no `app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres', // ou 'mysql', 'mariadb', etc.
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Process],
  synchronize: true, // Apenas para desenvolvimento
})
```

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes em modo watch
pnpm run test:watch

# Cobertura de testes
pnpm run test:cov

# Testes e2e
pnpm run test:e2e
```

## 📦 Scripts Disponíveis

```bash
pnpm run build          # Compila a aplicação
pnpm run start          # Inicia a aplicação
pnpm run start:dev      # Inicia em modo desenvolvimento
pnpm run start:debug    # Inicia em modo debug
pnpm run start:prod     # Inicia em modo produção
pnpm run lint           # Executa o linter
pnpm run format         # Formata o código
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no repositório.
