package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Adversario;
import com.dossiertreinador.domain.enums.TipoEvento;
import com.dossiertreinador.repository.AdversarioRepository;
import com.dossiertreinador.service.AdversarioService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class AdversarioServiceImpl implements AdversarioService {

    @PersistenceContext
    private EntityManager entityManager;

    private final AdversarioRepository repository;

    public AdversarioServiceImpl(AdversarioRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Adversario salvar(Adversario adversario) {
        if (adversario.getDataCriacao() == null) {
            adversario.setDataCriacao(LocalDateTime.now());
        }
        adversario.setUltimaAtualizacao(LocalDateTime.now());
        return repository.save(adversario);
    }

    @Override
    @Transactional
    public Adversario atualizar(Adversario adversario) {
        adversario.setUltimaAtualizacao(LocalDateTime.now());
        return repository.save(adversario);
    }

    @Override
    public void deletar(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public Adversario findById(UUID id) {
        Optional<Adversario> opt = repository.findById(id);
        return opt.orElseThrow(() -> new RuntimeException("Adversário não encontrado com ID: " + id));
    }

    @Override
    public List<Adversario> findByEventoCalendarioId(UUID eventoCalendarioId) {
        return repository.findByEventoCalendarioId(eventoCalendarioId);
    }

    @Override
    public List<Adversario> listarTodos() {
        return repository.findAll();
    }
}