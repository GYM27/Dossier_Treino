package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Epoca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * O Repositório para a entidade Epoca.
 * Ao estender JpaRepository, ganhamos automaticamente dezenas de métodos
 * prontos a usar (save, findById, findAll, delete) sem precisarmos de escrever 
 * uma única query SQL.
 */
@Repository
public interface EpocaRepository extends JpaRepository<Epoca, UUID> {
    
    // O Spring Data JPA é tão inteligente que se escrevermos nomes de métodos com a sintaxe certa,
    // ele gera a query SQL automaticamente por nós! (Iremos adicionar métodos aqui mais tarde)
}
