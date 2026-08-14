package com.dossiertreinador.controller;

import com.dossiertreinador.service.CalendarSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/eventos/equipa")
@RequiredArgsConstructor
public class CalendarSyncController {

    private final CalendarSyncService calendarSyncService;

    @GetMapping(value = "/{equipaId}/ical", produces = "text/calendar")
    public ResponseEntity<String> getICalForEquipa(@PathVariable UUID equipaId) {
        String icalContent = calendarSyncService.generateICalForEquipa(equipaId);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"calendario.ics\"");
        headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        headers.add(HttpHeaders.EXPIRES, "0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icalContent);
    }
}
