import express  from "express";
import pg       from "pg";
import redis    from "../ConexaoRedis/redisClient.js";
import jwt      from "jsonwebtoken";
import bcrypt   from "bcrypt";
import Validar  from "../Class/class.js"

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const app = express();
const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

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

        // const token = jwt.sign({ id: user.id, funcao: user.funcao }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erro ao autenticar", error });
    }
});

// Criar usuário
app.post("/usuarios", async (req, res) => {
    // Validação da classe
    const user = new Validar(req.body.nome, req.body.email, req.body.senha, req.body.funcao)
    const erros = user.validarCadastro()
    console.log("VOLTEI DO VALIDAR", erros)
    if (!erros.status) return res.status(400).json(erros)
    
    try {
        // Criptografia da senha
        const hashedPassword = await bcrypt.hash(user.senha, 10);
        console.log("INSERINDO NO BANCO", user)
        const result = await pool.query(
            "INSERT INTO usuarios (nome, email, senha, funcao) VALUES ($1, $2, $3, $4) RETURNING *", 
            [user.nome, user.email, hashedPassword, user.funcao]
        );
        res.status(201).json({ message: "Usuário criado com sucesso", user: result.rows[0].nome });

    } catch (error) {
        // Tratamento de erro do PostgreSQL.
        if (error.code === "23505") {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }
        res.status(500).json({ message: "Erro ao criar usuário", error });
    }
});

// Atualizar usuário
app.put("/usuarios/:id", async (req, res) => {
    const { id } = req.params;
    const user = new Validar(req.body.nome, req.body.email, req.body.senha, req.body.funcao)
    const erros = user.validarAlteracao()

    if (!erros.status) return res.status(400).json(erros)

    try {
        // Criar array para armazenar os campos a serem atualizados
        const updates = [];
        const values  = [];
        let index = 1;

        // Se 'nome' foi enviado no body
        // Adiciona "nome = $1" no array de updates
        // Adiciona o valor de 'nome' no array de valores
        /*{
            "nome": "Carlos",
            "funcao": "admin"
        }*/
        // updates = ["nome = $1", "funcao = $2"]; 
        // values  = ["Carlos", "admin"];
        if (user.nome) {
            updates.push(`nome = $${index}`);
            values.push(user.nome);
            index++;
        }
        if (user.email) {
            updates.push(`email = $${index}`);
            values.push(user.email);
            index++;
        }
        if (user.senha) {
            const hashedPassword = await bcrypt.hash(user.senha, 10);
            updates.push(`senha = $${index}`);
            values.push(hashedPassword);
            index++;
        }
        if (user.funcao) {
            updates.push(`funcao = $${index}`);
            values.push(user.funcao);
            index++;
        }

        // Se nenhum campo foi enviado
        if (updates.length === 0) return res.status(400).json({ message: "Nenhum campo para atualizar" });

        values.push(id);

        const query  = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });

        res.json({
            message: "Usuário atualizado com sucesso",
            usuario: {
                id  : result.rows[0].id,
                nome: result.rows[0].nome
            }
        });

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