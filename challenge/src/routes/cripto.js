import express   from "express";
import pg        from "pg";
import redis     from "../ConexaoRedis/redisClient.js";
import getCripto from "../Functions/functions.js";

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const app = express();
const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

app.use(express.json());

// Buscar na API da Coingecko todas as criptomoedas
app.get("/cripto", async (req, res) => {
    try {
        const response = await getCripto(req, res);
        const data = await response.json();
        
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar criptomoedas. Verifique a moeda informada."});
    } 
});

export default app