import express      from "express";
import pg           from "pg";
import redis        from "../ConexaoRedis/redisClient.js";
import getCripto    from "../Functions/functions.js";
import swaggerDocs  from "../Functions/swagger.js";

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const app = express();
const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

app.use(express.json());
swaggerDocs(app, env.LISTEN_PORT)

/**
 * @swagger
 * /api/cripto:
 *   get:
 *     summary: Busca informações de criptomoedas
 *     description: Retorna informações de criptomoedas a partir de uma moeda e ID de criptomoeda específicos.
 *     parameters:
 *       - in: query
 *         name: currency
 *         required: true
 *         schema:
 *           type: string
 *           enum: [usd, eur]
 *         description: Moeda para a qual as criptomoedas devem ser consultadas (USD ou EUR).
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da criptomoeda, como bitcoin, ethereum, etc.
 *     responses:
 *       200:
 *         description: Dados da criptomoeda encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_cripto:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   market_cap:
 *                     type: number
 *                   mudança_maxima:
 *                     type: number
 *                   variacao_24h:
 *                     type: number
 *                   valor_max_historico:
 *                     type: number
 *                   valor_min_historico:
 *                     type: number
 *                   valor_atual:
 *                     type: number
 *       400:
 *         description: Erro de validação de parâmetros
 *       500:
 *         description: Erro ao buscar criptomoedas
 */


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