package com.dossiertreinador.domain.enums;

import lombok.Getter;

/**
 * Enum que define os papéis (cargos) que os utilizadores podem ter na plataforma.
 * Usamos Enum em vez de String soltas para garantir que não há erros de escrita (typos).
 */
@Getter // O Lombok cria os getters automaticamente para podermos ler a 'descricao'
public enum Cargo {
    TREINADOR_PRINCIPAL("Treinador Principal"),
    TREINADOR_ADJUNTO("Treinador Adjunto"),
    PREPARADOR_FISICO("Preparador Físico"),
    TREINADOR_GUARDA_REDES("Treinador de Guarda-Redes"),
    DIRETOR_DESPORTIVO("Diretor Desportivo"),
    FISIOTERAPEUTA("Fisioterapeuta");

    // Campo que guarda a versão "legível e bonita" do cargo, para mostrar no ecrã (Frontend)
    private final String descricao;

    // Construtor do Enum: Quando o Java carrega o TREINADOR_PRINCIPAL, passa-lhe o texto em parênteses
    Cargo(String descricao) {
        this.descricao = descricao;
    }
}
