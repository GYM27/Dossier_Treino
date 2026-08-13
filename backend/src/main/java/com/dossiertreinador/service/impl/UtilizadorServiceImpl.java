package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.dtos.UtilizadorUpdateDTO;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.repository.UtilizadorRepository;
import com.dossiertreinador.service.UtilizadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UtilizadorServiceImpl implements UtilizadorService {

    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Utilizador atualizarPerfil(Utilizador utilizadorLogado, UtilizadorUpdateDTO dto) {
        utilizadorLogado.setNomeCompleto(dto.getNomeCompleto());
        
        if (dto.getNovaPassword() != null && !dto.getNovaPassword().trim().isEmpty()) {
            utilizadorLogado.setPasswordHash(passwordEncoder.encode(dto.getNovaPassword()));
        }
        
        return utilizadorRepository.save(utilizadorLogado);
    }
}
