import express from "express";
import pg from "pg";
import redis from "../ConexaoRedis/redisClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const app = express();
const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

// AVISO IMPORTANTE !!
// CRIAR UMA CLASSE PARA CADASTRO DE USUARIO

app.use(express.json());
// Autenticação JWT para usuários
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Acesso negado" });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
};

// Autenticar usuário
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: "Credenciais inválidas" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(String(senha), user.senha);
        if (!validPassword) return res.status(401).json({ message: "Credenciais inválidas" });

        const token = jwt.sign({ id: user.id, funcao: user.funcao }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erro ao autenticar", error });
    }
});

// Criar usuário
app.post("/usuarios", async (req, res) => {
    const { nome, email, senha, funcao } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10); // criptografa a senha
    
    try {
        console.log("VOU CRIAR O USUARIO", nome, email, hashedPassword, funcao, env.DATABASE_URL)
        const result = await pool.query(
            "INSERT INTO usuarios (nome, email, senha, funcao) VALUES ($1, $2, $3, $4) RETURNING *", 
            [nome, email, hashedPassword, funcao]
        );
        res.status(201).json({ message: "Usuário criado com sucesso", user: result.rows[0].nome });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar usuário", error });
    }
});

// Atualizar usuário
app.put("/usuarios/:id", /*authenticateToken,*/ async (req, res) => {
    const { id } = req.params;
    const { nome, email, funcao } = req.body;
    
    try {
        const result = await pool.query(
            "UPDATE usuarios SET nome = $1, email = $2, funcao = $3 WHERE id = $4 RETURNING *", 
            [nome, email, funcao, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar usuário", error });
    }
});

// Buscar todos os usuários ou filtrar por email/id
app.get("/usuarios", /*authenticateToken,*/ async (req, res) => {
    const { email, id } = req.query;

    try {
        let result;

        if (email) {
            result = await pool.query(
                "SELECT id, nome, email, funcao FROM usuarios WHERE email ILIKE $1",
                [`%${email}%`]
            );
        } else if (id) {
            result = await pool.query(
                "SELECT id, nome, email, funcao FROM usuarios WHERE id = $1",
                [id]
            );
        } else {
            // Se nenhum filtro for passado, busca todos os usuários
            result = await pool.query(
                "SELECT id, nome, email, funcao FROM usuarios"
            );
        }

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuários", error });
    }
});

export default app