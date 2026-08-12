package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.ConvocatoriaAtleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConvocatoriaAtletaRepository extends JpaRepository<ConvocatoriaAtleta, UUID> {
}
