package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Atleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.List;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, UUID> {
    
    // O Spring Data JPA é mágico: Ao chamar o método findByEquipaId, 
    // ele gera automaticamente o SQL "SELECT * FROM atleta WHERE equipa_id = ?"
    List<Atleta> findByEquipaId(UUID equipaId);
}
