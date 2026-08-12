package com.dossiertreinador.domain.enums;

import lombok.Getter;

/**
 * O "semáforo" da lesão. Indica em que fase do processo de recuperação o atleta se encontra.
 * 
 * Este estado é CRUCIAL porque a Convocatória (Etapa 10) vai consultar este campo:
 * se o atleta tiver alguma lesão que NÃO seja RECUPERADO, o sistema
 * recusa-o automaticamente da lista de convocados.
 */
@Getter
public enum EstadoLesao {
    EM_TRATAMENTO("Em Tratamento"),     // O atleta está a ser tratado, não treina
    EM_RECUPERACAO("Em Recuperação"),   // Já faz trabalho condicionado, mas não está apto
    RECUPERADO("Recuperado");           // Alta clínica, pode voltar a treinar e a jogar

    private final String descricao;

    EstadoLesao(String descricao) {
        this.descricao = descricao;
    }
}
