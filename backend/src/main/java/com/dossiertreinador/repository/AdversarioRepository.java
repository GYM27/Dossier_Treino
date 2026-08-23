package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Adversario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdversarioRepository extends JpaRepository<Adversario, UUID> {

    /**
     * Find an adversario by its name (unique constraint).
     * @param nome the name of the adversario
     * @return optional adversario
     */
    Optional<Adversario> findByNomeContainingIgnoreCase(String nome);

    /**
     * Find adversarios associated with a specific EventoCalendario.
     * @param eventoCalendarioId the event id
     * @return list of adversarios
     */
    List<Adversario> findByEventoCalendarioId(UUID eventoCalendarioId);
}