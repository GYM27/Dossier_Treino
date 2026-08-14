package com.dossiertreinador.domain.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

/**
 * Entidade que representa uma Equipa (ex: "Seniores", "Sub-19").
 * Como a tua plataforma suporta múltiplos escalões, todos os atletas e eventos 
 * estarão amarrados a uma Equipa e a uma Época.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O nome da equipa é obrigatório.")
    @Column(nullable = false)
    private String nome; // Exemplo: "Futebol Clube XPTO"

    @NotBlank(message = "O escalão é obrigatório.")
    @Column(nullable = false)
    private String escalao; // Exemplo: "Seniores" ou "Sub-19"

    @Column
    private String modalidade; // Exemplo: "Futebol"

    @Column
    private String duracaoJogo; // Exemplo: "45' + 45'"

    @Column
    private String numeroJogadores; // Exemplo: "Futebol 11"

    @Column
    private String emblemaUrl; // URL da imagem do clube

    // A MÁGICA DOS RELACIONAMENTOS EM SQL/JPA: 
    // @ManyToOne significa "Muitas Equipas podem pertencer a Uma Epoca".
    // 
    // FetchType.LAZY é crítico: Diz ao Hibernate "só vás à base de dados buscar os detalhes
    // da Época quando eu chamar explicitamente o método getEpoca() no Java". 
    // Se fosse EAGER (que é o padrão), o sistema carregava a época inteira sempre que quiséssemos 
    // ver apenas o nome da equipa, tornando tudo muito lento.
    // 
    // @JoinColumn diz o nome exato da coluna estrangeira que vai guardar o ID da época.
    @NotNull(message = "Uma equipa tem de estar associada a uma época.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epoca_id", nullable = false)
    private Epoca epoca;
}
