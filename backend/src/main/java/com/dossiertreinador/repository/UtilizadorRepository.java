package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.Optional;

@Repository
public interface UtilizadorRepository extends JpaRepository<Utilizador, UUID> {
    Optional<Utilizador> findByEmail(String email);
}
