package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.SessaoTreino;

import java.util.List;
import java.util.UUID;

public interface SessaoTreinoService {
    
    // Criar uma sessão vazia
    SessaoTreino criarSessao(SessaoTreino sessao);
    
    // Adicionar um exercício a uma sessão existente
    SessaoTreino adicionarExercicio(UUID sessaoId, UUID exercicioId, Integer ordem, Integer duracaoMinutos, String observacoes);
    
    List<SessaoTreino> listarPorEquipa(UUID equipaId);
    
    SessaoTreino buscarPorId(UUID id);
}
