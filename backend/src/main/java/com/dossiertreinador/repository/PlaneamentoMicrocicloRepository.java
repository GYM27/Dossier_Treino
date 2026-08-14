package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.PlaneamentoMicrociclo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaneamentoMicrocicloRepository extends JpaRepository<PlaneamentoMicrociclo, UUID> {
    
    List<PlaneamentoMicrociclo> findByEquipaIdOrderByDataInicioAsc(UUID equipaId);

    Optional<PlaneamentoMicrociclo> findByEquipaIdAndDataInicio(UUID equipaId, LocalDate dataInicio);
}
