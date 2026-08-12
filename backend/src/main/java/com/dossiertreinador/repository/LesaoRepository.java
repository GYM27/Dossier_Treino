package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositório da Lesão. As nossas três queries mágicas:
 *
 * 1. findByAtletaId → Histórico completo de lesões de um atleta
 * 2. findByEstadoLesaoNot → Todas as lesões ativas (que não estão RECUPERADO)
 * 3. findByAtletaEquipaIdAndEstadoLesaoNot → Lesionados de uma equipa específica
 *
 * A terceira é a mais poderosa: o Spring Data JPA lê o nome do método e percebe:
 * "Queres filtrar pela equipa do atleta E pelo estado da lesão? Eu faço o SQL por ti!"
 * Ele navega automaticamente pela relação Lesao → Atleta → Equipa → id
 */
@Repository
public interface LesaoRepository extends JpaRepository<Lesao, UUID> {

    // Todas as lesões de um atleta (para o histórico clínico individual)
    List<Lesao> findByAtletaId(UUID atletaId);

    // Lesionados ativos de uma equipa inteira (para a Convocatória na Etapa 10!)
    // Lê-se: "Encontra as lesões onde o atleta.equipa.id = X E o estado NÃO É Y"
    List<Lesao> findByAtletaEquipaIdAndEstadoLesaoNot(UUID equipaId, EstadoLesao estado);
}
