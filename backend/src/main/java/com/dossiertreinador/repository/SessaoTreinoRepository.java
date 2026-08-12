package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.SessaoTreino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessaoTreinoRepository extends JpaRepository<SessaoTreino, UUID> {

    // Encontrar todos os treinos de uma equipa
    List<SessaoTreino> findByEquipaIdOrderByDataDesc(UUID equipaId);
}
