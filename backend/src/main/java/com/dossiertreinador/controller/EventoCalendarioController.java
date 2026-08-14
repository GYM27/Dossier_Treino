package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.EventoCalendarioRequestDTO;
import com.dossiertreinador.domain.dtos.EventoCalendarioResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.mappers.EventoCalendarioMapper;
import com.dossiertreinador.service.EventoCalendarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoCalendarioController {

    private final EventoCalendarioService eventoService;
    private final EventoCalendarioMapper eventoMapper;

    @PostMapping("/equipa/{equipaId}")
    public ResponseEntity<EventoCalendarioResponseDTO> criarEventoEGerarGrelha(
            @PathVariable UUID equipaId,
            @RequestBody EventoCalendarioRequestDTO request) {
            
        EventoCalendario evento = EventoCalendario.builder()
                .equipa(Equipa.builder().id(equipaId).build())
                .tipoEvento(request.getTipoEvento())
                .dataHoraInicio(request.getDataHoraInicio())
                .dataHoraFim(request.getDataHoraFim())
                .descricao(request.getDescricao())
                .local(request.getLocal())
                .numeroTreino(request.getNumeroTreino())
                .equipaCasa(request.getEquipaCasa())
                .equipaFora(request.getEquipaFora())
                .build();
                
        EventoCalendario eventoGravado = eventoService.registarEventoEGerarGrelha(evento);
        return new ResponseEntity<>(eventoMapper.toResponseDTO(eventoGravado), HttpStatus.CREATED);
    }
    
    @GetMapping("/equipa/{equipaId}/semana")
    public ResponseEntity<List<EventoCalendarioResponseDTO>> listarEventosDaSemana(
            @PathVariable UUID equipaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
            
        List<EventoCalendarioResponseDTO> eventos = eventoService.listarEventosDaSemana(equipaId, start, end)
                .stream()
                .map(eventoMapper::toResponseDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(eventos);
    }
    
    @PutMapping("/{eventoId}")
    public ResponseEntity<EventoCalendarioResponseDTO> atualizarEvento(
            @PathVariable UUID eventoId,
            @RequestBody EventoCalendarioRequestDTO request) {
            
        EventoCalendario eventoAtualizado = EventoCalendario.builder()
                .tipoEvento(request.getTipoEvento())
                .dataHoraInicio(request.getDataHoraInicio())
                .dataHoraFim(request.getDataHoraFim())
                .descricao(request.getDescricao())
                .local(request.getLocal())
                .numeroTreino(request.getNumeroTreino())
                .equipaCasa(request.getEquipaCasa())
                .equipaFora(request.getEquipaFora())
                .build();
                
        EventoCalendario gravado = eventoService.atualizarEvento(eventoId, eventoAtualizado);
        return ResponseEntity.ok(eventoMapper.toResponseDTO(gravado));
    }
    
    @DeleteMapping("/{eventoId}")
    public ResponseEntity<Void> eliminarEvento(@PathVariable UUID eventoId) {
        eventoService.eliminarEvento(eventoId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/equipa/{equipaId}/ultimo-numero-treino")
    public ResponseEntity<Integer> obterUltimoNumeroTreino(@PathVariable UUID equipaId) {
        return ResponseEntity.ok(eventoService.obterUltimoNumeroTreino(equipaId));
    }
}
