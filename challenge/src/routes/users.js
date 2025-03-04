import express           from "express";
import pg                from "pg";
import jwt               from "jsonwebtoken";
import bcrypt            from "bcrypt";
import redis             from "../ConexaoRedis/redisClient.js";
import Validar           from "../Class/class.js"
import swaggerDocs       from "../Functions/swagger.js";
import authenticateToken from "../Functions/functions.js";

const envjs = await redis.getConfig("ENV")
let env = JSON.parse(envjs)

const app = express();
const { Pool } = pg;
const pool = new Pool({
    connectionString: env.DATABASE_URL
});

app.use(express.json());

swaggerDocs(app, env.LISTEN_PORT)

// // Autenticação JWT para usuários
// const authenticateToken = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) return res.status(401).json({ message: "Token não encontrado" });
    
//     jwt.verify(token, env.JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: "Token inválido" });
//         req.user = user;
//         next();
//     });
// };

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autenticação de usuários com email e senha.
 *     description: Rota para autenticar um usuário já cadastrado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *         description: Retorna o token de autenticação para ser utilizado no header Authorization
 *       401:
 *         description: Credenciais inválidas
 */

// Autenticar usuário
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1 LIMIT 1", [String(email)]);

        if (result.rows.length === 0) return res.status(401).json({ message: "Credenciais inválidas" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(String(senha), user.senha);
        if (!validPassword) return res.status(401).json({ message: "Credenciais inválidas" });

        const token = jwt.sign({ id: user.id, nome: user.nome }, env.JWT_SECRET, { expiresIn: "1h" });
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erro ao autenticar", error });
    }
});


/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Rota para criar um usuário com nome, email, senha e função.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               funcao:
 *                 type: string
 *                 enum: [admin, cliente]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */

// Criar usuário
app.post("/usuarios", async (req, res) => {
    // Validação da classe
    const user = new Validar(req.body.nome, req.body.email, req.body.senha, req.body.funcao)
    const erros = user.validarCadastro()
    if (!erros.status) return res.status(400).json(erros)
    
    try {
        // Criptografia da senha
        const hashedPassword = await bcrypt.hash(user.senha, 10);
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

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     description: Rota para atualizar um usuário pelo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               funcao:
 *                 type: string
 *                 enum: [admin, cliente]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Nenhum campo enviado para atualização
 *       404:
 *         description: Usuário não encontrado
 */

// Atualizar usuário
app.put("/usuarios/:id", authenticateToken.authenticateToken, async (req, res) => {
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


/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Busca usuários
 *     description: Retorna todos os usuários ou filtra por email ou id.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtra usuários pelo email (busca parcial).
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filtra usuários pelo ID exato.
 *     responses:
 *       200:
 *         description: Lista de usuários encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *                   funcao:
 *                     type: string
 *       500:
 *         description: Erro ao buscar usuários
 */

// Buscar todos os usuários ou filtrar por email/id
app.get("/usuarios", authenticateToken.authenticateToken, async (req, res) => {
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