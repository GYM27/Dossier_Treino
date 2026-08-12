package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.EstatisticaJogoRequestDTO;
import com.dossiertreinador.domain.dtos.EstatisticaJogoResponseDTO;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.mappers.EstatisticaJogoMapper;
import com.dossiertreinador.service.EstatisticaJogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eventos/{eventoId}/estatisticas")
@RequiredArgsConstructor
public class EstatisticaJogoController {

    private final EstatisticaJogoService estatisticaService;
    private final EstatisticaJogoMapper estatisticaMapper;

    @PostMapping
    public ResponseEntity<EstatisticaJogoResponseDTO> registarEstatistica(
            @PathVariable UUID eventoId,
            @Valid @RequestBody EstatisticaJogoRequestDTO dto) {

        EstatisticaJogo estatistica = estatisticaService.registarEstatistica(
                eventoId,
                dto.getAtletaId(),
                dto.getTipoEstatistica(),
                dto.getValor(),
                dto.getMinuto(),
                dto.getNotas()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(estatisticaMapper.toDTO(estatistica));
    }

    @GetMapping
    public ResponseEntity<List<EstatisticaJogoResponseDTO>> listarEstatisticasDoEvento(@PathVariable UUID eventoId) {
        List<EstatisticaJogoResponseDTO> resposta = estatisticaService.listarPorEvento(eventoId).stream()
                .map(estatisticaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resposta);
    }

    @DeleteMapping("/{estatisticaId}")
    public ResponseEntity<Void> removerEstatistica(
            @PathVariable UUID eventoId, // presente na rota por uma questão de REST (contexto)
            @PathVariable UUID estatisticaId) {
        estatisticaService.removerEstatistica(estatisticaId);
        return ResponseEntity.noContent().build();
    }
}
