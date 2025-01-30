import express from 'express'
import user from './routes/users.js'
import redis   from './ConexaoRedis/redisClient.js'
import cripto  from './routes/cripto.js'

const app = express()
app.use(express.json())

// PUXANDO DO REDIS O ENV
const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

app.use("/api", user)
app.use("/api", cripto)

app.listen(env.LISTEN_PORT, ()=>{ console.log("Executando na porta ", env.LISTEN_PORT)})