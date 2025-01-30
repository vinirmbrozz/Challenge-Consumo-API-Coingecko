import Redis from 'ioredis';
import { execSync } from 'child_process'

// Constante que recebe um objeto onde o Host é o serviço do Docker e a porta definida para o banco de dados Chave-Valor Redis.
const redisDB = {
    host: 'redis',
    port: '6379'
}
let redis = {}
// Tentar conectar no Redis, se não conectar vai esperar 15 segundos e tentar novamente.
try{
    redis = new Redis(redisDB)
}
catch(error){
    console.log('AGUARDANDO...', error)
    execSync('sleep 15')
    process.exit(1)
}

async function getConfig(key) {
    return await redis.get(key);
}

async function setConfig(key, value) {
    await redis.set(key, value);
}

export default{ getConfig, setConfig }