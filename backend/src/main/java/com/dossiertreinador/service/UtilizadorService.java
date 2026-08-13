package com.dossiertreinador.service;

import com.dossiertreinador.domain.dtos.UtilizadorUpdateDTO;
import com.dossiertreinador.domain.entities.Utilizador;

public interface UtilizadorService {
    Utilizador atualizarPerfil(Utilizador utilizadorLogado, UtilizadorUpdateDTO dto);
}
