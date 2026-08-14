package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.EventoCalendario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventoCalendarioRepository extends JpaRepository<EventoCalendario, UUID> {
    
    List<EventoCalendario> findByEquipaIdAndDataHoraInicioBetweenOrderByDataHoraInicioAsc(
            UUID equipaId, 
            LocalDateTime start, 
            LocalDateTime end
    );

    List<EventoCalendario> findByEquipaIdOrderByDataHoraInicioAsc(UUID equipaId);

    java.util.Optional<EventoCalendario> findTopByEquipaIdAndTipoEventoOrderByDataHoraInicioDesc(UUID equipaId, com.dossiertreinador.domain.enums.TipoEvento tipoEvento);
}
