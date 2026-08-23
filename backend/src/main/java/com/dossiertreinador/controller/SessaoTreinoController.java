package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.mappers.SessaoTreinoMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.SessaoTreinoRepository;
import com.dossiertreinador.service.SessaoTreinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/treinos")
@RequiredArgsConstructor
@Transactional
public class SessaoTreinoController {

    private final SessaoTreinoService sessaoTreinoService;
    private final SessaoTreinoMapper sessaoTreinoMapper;
    private final EquipaRepository equipaRepository;
    private final EventoCalendarioRepository eventoCalendarioRepository;
    private final SessaoTreinoRepository sessaoTreinoRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<SessaoTreinoResponseDTO> criarSessaoVazia(@Valid @RequestBody SessaoTreinoRequestDTO dto) {
        Equipa equipa = equipaRepository.findById(dto.getEquipaId())
                .orElseThrow(() -> new RuntimeException("Equipa não encontrada."));
                
        EventoCalendario evento = null;
        if (dto.getEventoId() != null) {
            evento = eventoCalendarioRepository.findById(dto.getEventoId())
                    .orElseThrow(() -> new RuntimeException("Evento de calendário não encontrado."));

            // Se o evento já criou automaticamente a sessão de treino, atualizamos os dados preenchidos pelo utilizador
            Optional<SessaoTreino> sessaoExistente = sessaoTreinoRepository.findByEventoCalendarioId(dto.getEventoId());
            if (sessaoExistente.isPresent()) {
                SessaoTreino atualizada = sessaoTreinoService.atualizarSessao(
                        sessaoExistente.get().getId(),
                        dto.getObjetivo(),
                        dto.getMaterial(),
                        dto.getNumeroJogadores(),
                        dto.getIntensidadeGeral(),
                        dto.getMesociclo(),
                        dto.getMicrociclo(),
                        dto.getUnidadeTreino()
                );
                return new ResponseEntity<>(sessaoTreinoMapper.toResponseDTO(atualizada), HttpStatus.CREATED);
            }
        }
                
        SessaoTreino entidade = sessaoTreinoMapper.toEntity(dto, equipa, evento);
        SessaoTreino salvo = sessaoTreinoService.criarSessao(entidade);
        
        return new ResponseEntity<>(sessaoTreinoMapper.toResponseDTO(salvo), HttpStatus.CREATED);
    }

    @GetMapping("/equipa/{equipaId}")
    public ResponseEntity<List<SessaoTreinoResponseDTO>> listarTreinosDaEquipa(@PathVariable UUID equipaId) {
        // Falta aqui a validação de segurança IDOR (só o treinador da equipa pode ver os seus treinos).
        // Isso seria adicionado no @PreAuthorize ou via Service de Segurança customizado.
        List<SessaoTreino> sessoes = sessaoTreinoService.listarPorEquipa(equipaId);
        
        List<SessaoTreinoResponseDTO> resposta = sessoes.stream()
                .map(sessaoTreinoMapper::toResponseDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<SessaoTreinoResponseDTO> buscarSessaoPorEvento(@PathVariable UUID eventoId) {
        SessaoTreino sessao = sessaoTreinoService.buscarPorEventoId(eventoId);
        return ResponseEntity.ok(sessaoTreinoMapper.toResponseDTO(sessao));
    }

    @PostMapping("/{sessaoId}/exercicios")
    public ResponseEntity<SessaoTreinoResponseDTO> adicionarExercicioAoTreino(
            @PathVariable UUID sessaoId,
            @RequestBody SessaoTreinoExercicioDTO dto) {
            
        SessaoTreino atualizada = sessaoTreinoService.adicionarExercicio(
                sessaoId, 
                dto.getExercicioId(), 
                dto.getOrdem(), 
                dto.getDuracaoMinutos(), 
                dto.getObservacoesDoTreinador()
        );
        
        return ResponseEntity.ok(sessaoTreinoMapper.toResponseDTO(atualizada));
    }

    @PutMapping("/{sessaoId}")
    public ResponseEntity<SessaoTreinoResponseDTO> atualizarSessao(
            @PathVariable UUID sessaoId,
            @RequestBody SessaoTreinoRequestDTO dto) {
        
        SessaoTreino atualizada = sessaoTreinoService.atualizarSessao(
                sessaoId,
                dto.getObjetivo(),
                dto.getMaterial(),
                dto.getNumeroJogadores(),
                dto.getIntensidadeGeral(),
                dto.getMesociclo(),
                dto.getMicrociclo(),
                dto.getUnidadeTreino()
        );
        
        return ResponseEntity.ok(sessaoTreinoMapper.toResponseDTO(atualizada));
    }

    @DeleteMapping("/{sessaoId}/exercicios/{assocId}")
    public ResponseEntity<Void> removerExercicioDaSessao(
            @PathVariable UUID sessaoId,
            @PathVariable UUID assocId) {
        
        sessaoTreinoService.removerExercicio(sessaoId, assocId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{sessaoId}/exercicios/{assocId}")
    public ResponseEntity<SessaoTreinoResponseDTO> atualizarExercicioNaSessao(
            @PathVariable UUID sessaoId,
            @PathVariable UUID assocId,
            @RequestBody SessaoTreinoExercicioDTO dto) {
            
        SessaoTreino atualizada = sessaoTreinoService.atualizarExercicioNaSessao(
                sessaoId, 
                assocId,
                dto.getExercicioId(),
                dto.getOrdem(), 
                dto.getDuracaoMinutos(), 
                dto.getObservacoesDoTreinador()
        );
        
        return ResponseEntity.ok(sessaoTreinoMapper.toResponseDTO(atualizada));
    }
}
