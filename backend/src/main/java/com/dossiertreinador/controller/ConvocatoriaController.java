package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.ConvocatoriaRequestDTO;
import com.dossiertreinador.domain.dtos.ConvocatoriaResponseDTO;
import com.dossiertreinador.domain.entities.Convocatoria;
import com.dossiertreinador.domain.mappers.ConvocatoriaMapper;
import com.dossiertreinador.service.ConvocatoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/convocatorias")
@RequiredArgsConstructor
public class ConvocatoriaController {

    private final ConvocatoriaService convocatoriaService;
    private final ConvocatoriaMapper convocatoriaMapper;

    @PostMapping("/evento/{eventoId}")
    public ResponseEntity<ConvocatoriaResponseDTO> criarConvocatoria(
            @PathVariable UUID eventoId,
            @Valid @RequestBody ConvocatoriaRequestDTO dto) {
            
        boolean forcar = dto.getForcarConvocatoria() != null && dto.getForcarConvocatoria();
        
        Convocatoria convocatoria = convocatoriaService.criarConvocatoria(
                eventoId, 
                dto.getAtletaIds(), 
                dto.getLimiteConvocados(), 
                dto.getObservacoes(),
                forcar
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convocatoriaMapper.toDTO(convocatoria));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<ConvocatoriaResponseDTO> obterConvocatoria(@PathVariable UUID eventoId) {
        Convocatoria convocatoria = convocatoriaService.obterConvocatoriaPorEvento(eventoId);
        return ResponseEntity.ok(convocatoriaMapper.toDTO(convocatoria));
    }
}
