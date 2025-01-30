class Validar {
    constructor(nome, email, senha, funcao) {
        this.nome   = nome;
        this.email  = email;
        this.senha  = senha;
        this.funcao = funcao;
    }

    validar() {
        const erros = [];

        if (!this.nome)                                 erros.push("Nome é obrigatório");
        if (!this.email || !this.email.includes("@"))   erros.push("E-mail inválido");
        if (!this.senha || this.senha.length < 6)       erros.push("A senha deve ter pelo menos 6 caracteres");
        if (!this.funcao)                               erros.push("Função é obrigatória");

        return erros.length > 0 ? { valido: false, erros } : { valido: true };
    }
}

export default Validar