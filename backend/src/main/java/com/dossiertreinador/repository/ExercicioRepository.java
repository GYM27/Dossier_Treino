package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExercicioRepository extends JpaRepository<Exercicio, UUID> {
    
    // Opcional: Buscar exercícios por categoria
    List<Exercicio> findByCategoria(CategoriaExercicio categoria);
}
