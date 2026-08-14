package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.RegistoAssiduidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RegistoAssiduidadeRepository extends JpaRepository<RegistoAssiduidade, UUID> {

    void deleteByEventoId(UUID eventoId);

    java.util.Optional<RegistoAssiduidade> findByEventoIdAndAtletaId(UUID eventoId, UUID atletaId);

    // --- A MAGIA DO JPQL (Java Persistence Query Language) ---
    // Em vez de escrevermos SQL puro que depende do Postgres, escrevemos JPQL que usa o nome 
    // das NOSSAS Classes Java (RegistoAssiduidade, r.atleta, r.evento). O Hibernate converte depois.
    @Query("SELECT r FROM RegistoAssiduidade r WHERE r.atleta.id = :atletaId " +
           "AND r.evento.dataHoraInicio >= :inicioMes AND r.evento.dataHoraInicio <= :fimMes")
    List<RegistoAssiduidade> findPresencasDoAtletaNoMes(
            @Param("atletaId") UUID atletaId, 
            @Param("inicioMes") LocalDateTime inicioMes, 
            @Param("fimMes") LocalDateTime fimMes);
            
    @Query("SELECT r FROM RegistoAssiduidade r WHERE r.evento.equipa.id = :equipaId " +
           "AND r.evento.dataHoraInicio >= :start AND r.evento.dataHoraInicio <= :end")
    List<RegistoAssiduidade> findByEquipaAndDateRange(
            @Param("equipaId") UUID equipaId, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end);
}
