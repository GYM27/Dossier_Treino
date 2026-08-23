package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Adversario;
import java.util.List;
import java.util.UUID;

public interface AdversarioService {

    Adversario salvar(Adversario adversario);

    Adversario atualizar(Adversario adversario);

    void deletar(UUID id);

    Adversario findById(UUID id);

    List<Adversario> findByEventoCalendarioId(UUID eventoCalendarioId);

    List<Adversario> listarTodos();
}