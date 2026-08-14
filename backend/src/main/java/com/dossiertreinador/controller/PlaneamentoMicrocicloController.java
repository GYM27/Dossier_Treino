package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.PlaneamentoMicrocicloRequestDTO;
import com.dossiertreinador.domain.dtos.PlaneamentoMicrocicloResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.PlaneamentoMicrociclo;
import com.dossiertreinador.domain.mappers.PlaneamentoMicrocicloMapper;
import com.dossiertreinador.service.PlaneamentoMicrocicloService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/microciclos")
@RequiredArgsConstructor
public class PlaneamentoMicrocicloController {

    private final PlaneamentoMicrocicloService planeamentoService;
    private final PlaneamentoMicrocicloMapper planeamentoMapper;

    @GetMapping("/equipa/{equipaId}")
    public ResponseEntity<List<PlaneamentoMicrocicloResponseDTO>> listarPlaneamentos(@PathVariable UUID equipaId) {
        List<PlaneamentoMicrocicloResponseDTO> list = planeamentoService.listarPlaneamentos(equipaId).stream()
                .map(planeamentoMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/equipa/{equipaId}/semana")
    public ResponseEntity<PlaneamentoMicrocicloResponseDTO> obterPlaneamentoSemana(
            @PathVariable UUID equipaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio) {
        PlaneamentoMicrociclo p = planeamentoService.obterPlaneamentoSemana(equipaId, dataInicio);
        if (p == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(planeamentoMapper.toResponseDTO(p));
    }

    @PostMapping("/equipa/{equipaId}")
    public ResponseEntity<PlaneamentoMicrocicloResponseDTO> guardarPlaneamento(
            @PathVariable UUID equipaId,
            @RequestBody PlaneamentoMicrocicloRequestDTO request) {

        PlaneamentoMicrociclo p = PlaneamentoMicrociclo.builder()
                .dataInicio(request.getDataInicio())
                .dataFim(request.getDataFim())
                .numeroMicrociclo(request.getNumeroMicrociclo())
                .numeroMorfociclo(request.getNumeroMorfociclo())
                .equipa(Equipa.builder().id(equipaId).build())
                .build();

        PlaneamentoMicrociclo guardado = planeamentoService.guardarPlaneamento(p);
        return ResponseEntity.ok(planeamentoMapper.toResponseDTO(guardado));
    }
}
