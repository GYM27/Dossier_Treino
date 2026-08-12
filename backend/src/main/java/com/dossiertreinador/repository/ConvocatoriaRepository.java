package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Convocatoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConvocatoriaRepository extends JpaRepository<Convocatoria, UUID> {
    
    // Busca a convocatória oficial de um jogo específico
    Optional<Convocatoria> findByEventoCalendarioId(UUID eventoId);
}
