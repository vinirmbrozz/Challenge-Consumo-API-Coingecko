import pg       from "pg";
import redis    from "../ConexaoRedis/redisClient.js";

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

// Criar uma função para buscar as criptomoedas

const getCripto = async (req, res) => {
    try {
        // RECEBE A CURRENCY 
        const { currency, id } = req.query;
        console.log(currency)

        if (!currency) return res.status(400).json({ message: "Moeda não informada!" });

        if (!id)       return res.status(400).json({ message: "Id da criptomoeda nao informado! Exemplo: id=bitcoin, id=ethereum" });

        // Ou se não for nenhum das moedas: [USD, EUR, BTC] lowerCase
        if (!["usd", "eur"].includes(currency.toLowerCase())) {
            return res.status(400).json({ message: "Moeda inválida! As moedas disponíveis são: [USD, EUR]" });
        }

        // Monta a URL
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}`;
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'x-cg-pro-api-key': 'CG-z2B2wgh1MCPSecvWcrdV4hfZ' }
        };
        const response = await fetch(url, options);
        const data = await response.json();
        const criptomoedas = [];

        // Iterando na lista de objetos que a API da Coingecko retorna
        for (const item of data) {
            const {
                id,
                name,
                market_cap,
                ath_change_percentage,
                price_change_percentage_24h,
                ath,
                atl,
                current_price
            } = item;

            // Agora, inserindo os dados no banco de dados
            const query = `
                INSERT INTO criptomoedas (id_cripto, nome, market_cap, mudança_maxima, variacao_24h, valor_max_historico, valor_min_historico, valor_atual)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
            const values = [
                id,
                name,
                market_cap,
                ath_change_percentage,
                price_change_percentage_24h,
                ath,
                atl,
                current_price
            ];

            // Executando a query de inserção
            const result = await pool.query(query, values);
            
            // Adicionando os dados no array para retornar para o cliente
            criptomoedas.push(result.rows[0]);
        }

        // Filtrando na lista, o id da criptomoeda que foi passada como parâmetro
        // E retornando apenas os dados dessa criptomoeda
        res.json(criptomoedas.filter((criptomoeda) => criptomoeda.id_cripto === id));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar criptomoedas: ", error });
    }
};

export default getCripto