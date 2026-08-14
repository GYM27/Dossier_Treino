package com.dossiertreinador.domain.enums;

/**
 * Define o estado da presença de um atleta num evento.
 */
public enum TipoAssiduidade {
    PRESENTE,
    AUSENTE, // Legacy
    FALTA_INJUSTIFICADA,
    FALTA_JUSTIFICADA,
    FALTA_AUTORIZADA,
    ATRASADO,
    LESIONADO,
    AO_SERVICO_SELECAO,
    DISPENSADO, // Legacy
    TREINO_CONDICIONADO,
    OUTRO
}
