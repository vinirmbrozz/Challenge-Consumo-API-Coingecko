# API de Criptomoedas

Esta é uma API que fornece informações sobre criptomoedas, como o valor atual, variação de preço, e dados históricos, utilizando dados da API CoinGecko. A aplicação permite cadastrar e consultar informações sobre usuários, além de realizar buscas filtradas de criptomoedas.

## Funcionalidades

- **Cadastro de Usuários**: Crie, consulte, e atualize usuários no sistema.
- **Consulta de Criptomoedas**: Consulte informações sobre criptomoedas, como preço atual e histórico, utilizando moedas de referência como USD e EUR.
- **Documentação Swagger**: A API vem com uma documentação Swagger interativa para facilitar o uso das rotas.

## Tecnologias

- Node.js
- Express.js
- PostgreSQL (para persistência de dados)
- Redis (para configuração e cache)
- CoinGecko API (para dados de criptomoedas)
- Swagger UI (para documentação interativa)

## Como Rodar

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/vinirmbrozz/Challenge-Consumo-API-Coingecko.git

2. **Instale as dependências**:
   - npm install

3. **Rodar o arquivo ./buildImages.sh para buildar as imagens do docker compose**:

4. **Subir as imagens Redis e Postgres**:
   - docker compose up -d redis postgres

5. **Gravar no Redis o arquivo 'ENV.json', que se encontra na pasta 'redis_keys' para o consumo das variáveis necessárias**:

6. **Criar as tabelas do arquivo de 'tabelas.sql' dentro da imagem do Postgres**:
7. **Subir o restante das imagens**:
   - docker compose up -d
