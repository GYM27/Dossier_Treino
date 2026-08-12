package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.enums.TipoEstatistica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EstatisticaJogoRepository extends JpaRepository<EstatisticaJogo, UUID> {

    List<EstatisticaJogo> findByEventoCalendarioId(UUID eventoId);
    
    List<EstatisticaJogo> findByAtletaId(UUID atletaId);

    // Query JPQL Agregada: Somar todos os golos (ou outra estatística) de um atleta numa dada época
    @Query("SELECT COALESCE(SUM(e.valor), 0) FROM EstatisticaJogo e " +
           "WHERE e.atleta.id = :atletaId " +
           "AND e.tipoEstatistica = :tipoEstatistica " +
           "AND e.eventoCalendario.equipa.epoca.id = :epocaId")
    Integer somarEstatisticaPorAtletaEEpoca(
            @Param("atletaId") UUID atletaId, 
            @Param("tipoEstatistica") TipoEstatistica tipo, 
            @Param("epocaId") UUID epocaId);
}
