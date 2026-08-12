package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.service.AtletaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Esta é a implementação verdadeira (o Cérebro) que cumpre o contrato do AtletaService.
 */
@Service // Diz ao Spring: "Isto é um Cérebro! Guarda-o na tua memória para eu usar quando quiser".
@RequiredArgsConstructor // Magia do Lombok: Cria um construtor automático que injeta o nosso repositório.
public class AtletaServiceImpl implements AtletaService {

    // A nossa ligação direta ao porteiro da base de dados.
    // Usamos 'final' para garantir que este repositório nunca é apagado ou substituído acidentalmente.
    private final AtletaRepository atletaRepository;

    @Override
    public Atleta registarNovoAtleta(Atleta atleta) {
        // Por agora, a nossa lógica de negócio é simples:
        // Apenas mandamos o repositório gravar. 
        // Mais tarde, poderíamos acrescentar aqui o envio de um email de boas-vindas!
        return atletaRepository.save(atleta);
    }

    @Override
    public java.util.List<Atleta> listarTodos() {
        return atletaRepository.findAll();
    }
}
