class Validar {
    constructor(nome, email, senha, funcao) {
        this.nome   = nome;
        this.email  = email;
        this.senha  = senha;
        this.funcao = funcao;
    }

    validarCadastro() {
        const erros = [];
        
        // Expressão regular para validar e-mail (sem caracteres inválidos).
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!this.nome)                                                 erros.push("Nome é obrigatório");
        if (!this.email || !emailRegex.test(this.email))                erros.push("E-mail inválido. Use um formato válido como exemplo@email.com");
        if (!this.senha || this.senha.length < 6)                       erros.push("A senha deve ter pelo menos 6 caracteres");
        if (!["admin", "cliente"].includes(this.funcao.toLowerCase()))  erros.push("Função deve ser 'admin' ou 'cliente'");

        return erros.length > 0 ? { status: false, erros } : { status: true };
    }

    validarAlteracao() {
        // Pode ou não ter os campos
        // Podendo ter um ou todos

        const erros = [];

        if (this.email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!this.email || !emailRegex.test(this.email))               erros.push("E-mail inválido. Use um formato válido como exemplo@email.com");
        }
        if (this.senha) {
            if (!this.senha || this.senha.length < 6)                      erros.push("A senha deve ter pelo menos 6 caracteres");
        }
        if (this.funcao) {
            if (!["admin", "cliente"].includes(this.funcao.toLowerCase())) erros.push("Função deve ser 'admin' ou 'cliente'");
        }

        return erros.length > 0 ? { status: false, erros } : { status: true };

    }
}

export default Validar