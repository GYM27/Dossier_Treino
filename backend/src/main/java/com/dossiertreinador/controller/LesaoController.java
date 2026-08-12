package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.LesaoDetalhadaDTO;
import com.dossiertreinador.domain.dtos.LesaoRequestDTO;
import com.dossiertreinador.domain.dtos.LesaoResumidaDTO;
import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.mappers.LesaoMapper;
import com.dossiertreinador.service.LesaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lesoes")
@RequiredArgsConstructor
public class LesaoController {

    private final LesaoService lesaoService;
    private final LesaoMapper lesaoMapper;

    @PostMapping("/atleta/{atletaId}")
    public ResponseEntity<LesaoDetalhadaDTO> registarLesao(
            @PathVariable UUID atletaId,
            @Valid @RequestBody LesaoRequestDTO dto) {
        
        Lesao lesao = lesaoMapper.toEntity(dto);
        Lesao novaLesao = lesaoService.registarLesao(atletaId, lesao);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(lesaoMapper.toDetalhadaDTO(novaLesao));
    }

    @PatchMapping("/{lesaoId}/estado")
    public ResponseEntity<LesaoDetalhadaDTO> atualizarEstado(
            @PathVariable UUID lesaoId,
            @RequestParam EstadoLesao novoEstado) {
        
        Lesao lesaoAtualizada = lesaoService.atualizarEstado(lesaoId, novoEstado);
        return ResponseEntity.ok(lesaoMapper.toDetalhadaDTO(lesaoAtualizada));
    }

    @GetMapping("/atleta/{atletaId}/historico")
    public ResponseEntity<List<LesaoDetalhadaDTO>> listarHistoricoPorAtleta(@PathVariable UUID atletaId) {
        // NOTA: Por agora devolvemos a vista Detalhada. 
        // Quando implementarmos os Papéis (Etapa 12), podemos usar @PreAuthorize
        // ou verificar o SecurityContext aqui para devolver LesaoResumidaDTO se for VISUALIZADOR.
        List<Lesao> historico = lesaoService.listarHistoricoPorAtleta(atletaId);
        
        List<LesaoDetalhadaDTO> dtos = historico.stream()
                .map(lesaoMapper::toDetalhadaDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/equipa/{equipaId}/ativos")
    public ResponseEntity<List<LesaoResumidaDTO>> listarLesionadosAtivosPorEquipa(@PathVariable UUID equipaId) {
        // A lista de lesionados para a Convocatória só precisa de dados Resumidos (nome e estado)
        List<Lesao> lesionados = lesaoService.listarLesionadosAtivosPorEquipa(equipaId);
        
        List<LesaoResumidaDTO> dtos = lesionados.stream()
                .map(lesaoMapper::toResumidaDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }
}
