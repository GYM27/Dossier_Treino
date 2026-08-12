package com.dossiertreinador.domain.enums;

import lombok.Getter;

/**
 * Classifica a NATUREZA da lesão sofrida pelo atleta.
 * Isto permite ao fisioterapeuta e ao treinador categorizar rapidamente o tipo de problema
 * e, no futuro, gerar estatísticas (ex: "60% das lesões da equipa são musculares").
 */
@Getter
public enum TipoLesao {
    MUSCULAR("Muscular"),           // Ex: Rotura de fibras, contratura
    ARTICULAR("Articular"),         // Ex: Entorse do tornozelo
    OSSEA("Óssea"),                 // Ex: Fratura de stress
    LIGAMENTAR("Ligamentar"),       // Ex: Rotura do ligamento cruzado anterior
    CONCUSSAO("Concussão"),         // Ex: Traumatismo craniano
    OUTRA("Outra");                 // Ex: Doença, problemas não-musculoesqueléticos

    private final String descricao;

    TipoLesao(String descricao) {
        this.descricao = descricao;
    }
}
