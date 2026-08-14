package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.service.CalendarSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarSyncServiceImpl implements CalendarSyncService {

    private final EquipaRepository equipaRepository;
    private final EventoCalendarioRepository eventoCalendarioRepository;

    @Override
    public String generateICalForEquipa(UUID equipaId) {
        Equipa equipa = equipaRepository.findById(equipaId)
                .orElseThrow(() -> new IllegalArgumentException("Equipa não encontrada com ID: " + equipaId));

        List<EventoCalendario> eventos = eventoCalendarioRepository.findByEquipaIdOrderByDataHoraInicioAsc(equipaId);

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//Dossier do Treinador//PT\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("X-WR-CALNAME:DT - ").append(equipa.getNome()).append("\r\n");
        sb.append("X-WR-TIMEZONE:Europe/Lisbon\r\n");
        sb.append("REFRESH-INTERVAL;VALUE=DURATION:PT1H\r\n"); // Tentar forçar o refresh a cada hora

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

        for (EventoCalendario evento : eventos) {
            sb.append("BEGIN:VEVENT\r\n");
            
            // Gerar UID simples (ID do evento + domínio)
            sb.append("UID:").append(evento.getId()).append("@dossiertreinador.com\r\n");
            
            // Timestamp de criação/edição (usar agora)
            String nowStr = ZonedDateTime.now(ZoneId.of("UTC")).format(dtf);
            sb.append("DTSTAMP:").append(nowStr).append("\r\n");

            // Converter LocalDateTime (Lisboa) para UTC
            ZonedDateTime startUtc = evento.getDataHoraInicio().atZone(ZoneId.of("Europe/Lisbon")).withZoneSameInstant(ZoneId.of("UTC"));
            sb.append("DTSTART:").append(startUtc.format(dtf)).append("\r\n");

            if (evento.getDataHoraFim() != null) {
                ZonedDateTime endUtc = evento.getDataHoraFim().atZone(ZoneId.of("Europe/Lisbon")).withZoneSameInstant(ZoneId.of("UTC"));
                sb.append("DTEND:").append(endUtc.format(dtf)).append("\r\n");
            } else {
                // Se não tiver fim, assume-se 1 hora e meia depois (padrão de treino/jogo)
                ZonedDateTime endUtc = startUtc.plusMinutes(90);
                sb.append("DTEND:").append(endUtc.format(dtf)).append("\r\n");
            }

            // Resumo (Título)
            String titulo = evento.getTipoEvento().name();
            if (evento.getDescricao() != null && !evento.getDescricao().isBlank()) {
                titulo += " - " + evento.getDescricao();
            }
            sb.append("SUMMARY:").append(escapeIcalText(titulo)).append("\r\n");

            // Local
            if (evento.getLocal() != null && !evento.getLocal().isBlank()) {
                sb.append("LOCATION:").append(escapeIcalText(evento.getLocal())).append("\r\n");
            }

            // Descrição longa
            sb.append("DESCRIPTION:").append(escapeIcalText("Evento agendado via Dossier do Treinador.")).append("\r\n");

            sb.append("END:VEVENT\r\n");
        }

        sb.append("END:VCALENDAR\r\n");

        return sb.toString();
    }

    private String escapeIcalText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(";", "\\;")
                   .replace(",", "\\,")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }
}
