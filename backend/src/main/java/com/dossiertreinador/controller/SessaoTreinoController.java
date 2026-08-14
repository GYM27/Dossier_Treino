package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.mappers.SessaoTreinoMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.service.SessaoTreinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/treinos")
@RequiredArgsConstructor
public class SessaoTreinoController {

    private final SessaoTreinoService sessaoTreinoService;
    private final SessaoTreinoMapper sessaoTreinoMapper;
    private final EquipaRepository equipaRepository; // Num cenário mais complexo teríamos um EquipaService

    @PostMapping
    public ResponseEntity<SessaoTreinoResponseDTO> criarSessaoVazia(@Valid @RequestBody SessaoTreinoRequestDTO dto) {
        Equipa equipa = equipaRepository.findById(dto.getEquipaId())
                .orElseThrow(() -> new RuntimeException("Equipa não encontrada."));
                
        SessaoTreino entidade = sessaoTreinoMapper.toEntity(dto, equipa);
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
}
