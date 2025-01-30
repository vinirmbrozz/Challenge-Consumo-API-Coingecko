CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    funcao VARCHAR(10) CHECK (funcao IN ('admin', 'cliente')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE criptomoedas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    market_cap NUMERIC NOT NULL,
    variacao_24h NUMERIC NOT NULL,
    variacao_7d NUMERIC NOT NULL,
    valor_max_historico NUMERIC NOT NULL,
    valor_min_historico NUMERIC NOT NULL,
    valor_atual NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
