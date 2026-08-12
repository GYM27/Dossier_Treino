package com.dossiertreinador.controller;

import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.service.EventoCalendarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoCalendarioController {

    private final EventoCalendarioService eventoService;

    // Para fins didáticos, e para evitar a criação de mais 3 ficheiros de DTO/Mapper
    // vamos receber a Entidade diretamente neste controlador.
    // Assim que este endpoint for chamado, a Lógica de Batch Insert que criámos na Etapa 5 dispara!
    @PostMapping
    public ResponseEntity<EventoCalendario> criarEventoEGerarGrelha(@RequestBody EventoCalendario evento) {
        EventoCalendario eventoGravado = eventoService.registarEventoEGerarGrelha(evento);
        return new ResponseEntity<>(eventoGravado, HttpStatus.CREATED);
    }
}
