package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Utilizador;

public interface EquipaService {
    Equipa criarEquipa(Equipa equipa, String designacaoEpoca, Utilizador utilizador);
}
