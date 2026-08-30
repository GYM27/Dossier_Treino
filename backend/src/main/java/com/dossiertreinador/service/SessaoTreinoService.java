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
    
    // Atualizar metadados de uma sessão existente (objetivo, material, periodização, etc.)
    SessaoTreino atualizarSessao(UUID id, String objetivo, String material, Integer numeroJogadores, Integer intensidadeGeral, Integer mesociclo, Integer microciclo, Integer unidadeTreino, String periodo);
    
    // Remover um exercício associado a uma sessão
    void removerExercicio(UUID sessaoId, UUID exercicioAssocId);
    
    // Atualizar um exercício associado a uma sessão (re-associação de exercício, ordem, duração, observações)
    SessaoTreino atualizarExercicioNaSessao(UUID sessaoId, UUID exercicioAssocId, UUID novoExercicioId, Integer ordem, Integer duracaoMinutos, String observacoes);
    
    // Reordenar atomicamente a lista de exercícios da sessão
    SessaoTreino reordenarExercicios(UUID sessaoId, List<UUID> exercicioAssocIds);
}
