package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.RegistoAssiduidadeResponseDTO;
import com.dossiertreinador.domain.dtos.RegistoAssiduidadeUpdateDTO;
import com.dossiertreinador.domain.mappers.RegistoAssiduidadeMapper;
import com.dossiertreinador.service.RegistoAssiduidadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assiduidade")
@RequiredArgsConstructor
public class RegistoAssiduidadeController {

    private final RegistoAssiduidadeService registoService;
    private final RegistoAssiduidadeMapper registoMapper;

    @GetMapping("/equipa/{equipaId}/semana")
    public ResponseEntity<List<RegistoAssiduidadeResponseDTO>> listarAssiduidadeDaSemana(
            @PathVariable UUID equipaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        List<RegistoAssiduidadeResponseDTO> registos = registoService.listarAssiduidadeDaSemana(equipaId, start, end)
                .stream()
                .map(registoMapper::toResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(registos);
    }

    @PutMapping("/{registoId}")
    public ResponseEntity<RegistoAssiduidadeResponseDTO> atualizarRegisto(
            @PathVariable UUID registoId,
            @Valid @RequestBody RegistoAssiduidadeUpdateDTO updateDTO) {

        var atualizado = registoService.atualizarRegisto(registoId, updateDTO);
        return ResponseEntity.ok(registoMapper.toResponseDTO(atualizado));
    }

    @PutMapping("/evento/{eventoId}/atleta/{atletaId}")
    public ResponseEntity<RegistoAssiduidadeResponseDTO> upsertRegisto(
            @PathVariable UUID eventoId,
            @PathVariable UUID atletaId,
            @Valid @RequestBody RegistoAssiduidadeUpdateDTO updateDTO) {
        
        var atualizado = registoService.upsertRegisto(eventoId, atletaId, updateDTO);
        return ResponseEntity.ok(registoMapper.toResponseDTO(atualizado));
    }
}
