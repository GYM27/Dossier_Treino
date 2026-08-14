package com.dossiertreinador.service;

import java.util.UUID;

public interface CalendarSyncService {
    String generateICalForEquipa(UUID equipaId);
}
