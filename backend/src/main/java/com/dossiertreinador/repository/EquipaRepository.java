package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Equipa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EquipaRepository extends JpaRepository<Equipa, UUID> {
}
