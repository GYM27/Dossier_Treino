package com.dossiertreinador.domain.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Entidade que representa uma Época Desportiva (ex: "2025/2026").
 * Tudo no sistema vai estar de alguma forma ligado a uma época.
 */
@Entity // Diz ao Hibernate: "Por favor, transforma isto numa tabela na base de dados!"
@Getter // O Lombok cria automaticamente os métodos getDesignacao(), getId(), etc.
@Setter // O Lombok cria os métodos setDesignacao(), etc.
@NoArgsConstructor // O Lombok cria um construtor vazio (obrigatório para o Hibernate)
@AllArgsConstructor // O Lombok cria um construtor com todos os argumentos
@Builder // Padrão Builder: Permite construir o objeto passo-a-passo (Epoca.builder().designacao("..").build())
public class Epoca {

    @Id // Define qual é a Chave Primária (PK)
    @GeneratedValue(strategy = GenerationType.UUID) // Manda o Postgres/H2 gerar um UUID seguro e único
    private UUID id;

    // @NotBlank vem da biblioteca Validation. Impede que nos enviem uma String vazia ou cheia de espaços.
    @NotBlank(message = "A designação da época não pode estar vazia.")
    @Size(max = 20) // Validação a nível do Java
    @Column(nullable = false, length = 20) // Validação a nível da tabela SQL
    private String designacao;

    @NotNull(message = "A data de início é obrigatória.")
    @Column(nullable = false)
    private LocalDate dataInicio;

    @NotNull(message = "A data de fim é obrigatória.")
    @Column(nullable = false)
    private LocalDate dataFim;

    @Column(nullable = false)
    @Builder.Default // Diz ao Lombok Builder para respeitar este valor por defeito
    private Boolean isAtiva = true;
}
