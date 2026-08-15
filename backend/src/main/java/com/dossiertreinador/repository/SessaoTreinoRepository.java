package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.SessaoTreino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessaoTreinoRepository extends JpaRepository<SessaoTreino, UUID> {

    // Encontrar todos os treinos de uma equipa
    List<SessaoTreino> findByEquipaIdOrderByEventoCalendario_DataHoraInicioDesc(UUID equipaId);

    // Encontrar SessaoTreino pelo ID do evento calendário associado
    Optional<SessaoTreino> findByEventoCalendarioId(UUID eventoId);

    // Apagar SessaoTreino pelo ID do evento calendário associado (necessário para eliminar um Evento)
    void deleteByEventoCalendarioId(UUID eventoId);
}
