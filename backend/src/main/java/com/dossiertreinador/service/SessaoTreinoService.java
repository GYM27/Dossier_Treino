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
    SessaoTreino buscarPorEventoId(UUID eventoId);
    
    // Atualizar metadados de uma sessão existente (objetivo, material, etc.)
    SessaoTreino atualizarSessao(UUID id, String objetivo, String material, Integer numeroJogadores, Integer intensidadeGeral);
    
    // Remover um exercício associado a uma sessão
    void removerExercicio(UUID sessaoId, UUID exercicioAssocId);
}
