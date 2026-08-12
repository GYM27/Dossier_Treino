package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.TipoLesao;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Boletim Clínico: cada registo desta tabela representa UMA lesão de UM atleta.
 * Um atleta pode ter múltiplas lesões ao longo da época (infelizmente).
 *
 * 🔐 RGPD: Esta entidade contém DADOS SENSÍVEIS de saúde.
 * Por isso, implementamos Audit Logging (quem criou, quem alterou, quando).
 * O campo 'descricao' (texto clínico) só é visível para papéis autorizados.
 *
 * A anotação @EntityListeners(AuditingEntityListener.class) é o que diz ao Spring:
 * "Sempre que esta entidade for criada ou modificada, preenche automaticamente
 * os campos marcados com @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy".
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class) // Ativa a Auditoria Automática do JPA!
public class Lesao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // --- DADOS CLÍNICOS ---

    @NotNull(message = "O tipo de lesão é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoLesao tipoLesao; // Ex: MUSCULAR, LIGAMENTAR

    // 🔐 CAMPO SENSÍVEL RGPD: "Rotura parcial do ligamento cruzado anterior do joelho direito"
    // Este texto SÓ pode ser visto por TREINADOR_PRINCIPAL e FISIOTERAPEUTA
    @Column(columnDefinition = "TEXT") // TEXT permite textos longos (sem limite de 255 caracteres)
    private String descricao;

    @NotNull(message = "A data da lesão é obrigatória.")
    @Column(nullable = false)
    private LocalDate dataOcorrencia;

    // Pode ser null se o fisioterapeuta ainda não souber quando o atleta volta
    @Column
    private LocalDate dataRetornoPrevista;

    @NotNull(message = "O estado da lesão é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoLesao estadoLesao; // O "semáforo": EM_TRATAMENTO, EM_RECUPERACAO, RECUPERADO

    @Column(columnDefinition = "TEXT")
    private String observacoes; // Notas livres do fisioterapeuta

    // --- RELACIONAMENTO ---
    // Cada lesão pertence a UM atleta. Um atleta pode ter MUITAS lesões.
    @NotNull(message = "A lesão tem de estar associada a um atleta.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_id", nullable = false)
    private Atleta atleta;

    // --- 🔐 CAMPOS DE AUDITORIA RGPD ---
    // O Spring preenche estes campos SOZINHO quando usamos @EnableJpaAuditing

    // Quem criou este registo? (Será preenchido com o nome do utilizador autenticado)
    @CreatedBy
    @Column(updatable = false) // Uma vez escrito, nunca mais se altera (imutável)
    private String registadoPor;

    // Quem fez a última alteração? (Ex: quem mudou o estado de EM_TRATAMENTO para RECUPERADO)
    @LastModifiedBy
    private String alteradoPor;

    // Quando foi criado?
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    // Quando foi a última alteração?
    @LastModifiedDate
    private LocalDateTime dataAlteracao;
}
