package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.RegistoAssiduidade;
import com.dossiertreinador.domain.enums.TipoAssiduidade;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.RegistoAssiduidadeRepository;
import com.dossiertreinador.service.EventoCalendarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoCalendarioServiceImpl implements EventoCalendarioService {

    private final EventoCalendarioRepository eventoRepository;
    private final AtletaRepository atletaRepository;
    private final RegistoAssiduidadeRepository registoRepository;

    @Override
    @Transactional // Diz ao Spring: "Faz todas as gravações na BD juntas. Se alguma falhar, anula tudo!"
    public EventoCalendario registarEventoEGerarGrelha(EventoCalendario evento) {
        
        // 1. Gravar o Evento (Treino, Jogo, etc) na base de dados
        EventoCalendario eventoGravado = eventoRepository.save(evento);

        // 2. Ir procurar à BD TODOS os atletas que pertencem a esta equipa
        List<Atleta> atletasDaEquipa = atletaRepository.findByEquipaId(eventoGravado.getEquipa().getId());

        // 3. (Lógica de Negócio) Mapear cada atleta num Registo de Assiduidade com estado PRESENTE
        List<RegistoAssiduidade> grelhaDeAssiduidade = atletasDaEquipa.stream()
                .map(atleta -> RegistoAssiduidade.builder()
                        .evento(eventoGravado)
                        .atleta(atleta)
                        .tipoAssiduidade(TipoAssiduidade.PRESENTE) // Regra: por defeito todos presentes
                        .build())
                .collect(Collectors.toList());

        // 4. Batch Insert! Grava a grelha toda de uma vez só na base de dados
        registoRepository.saveAll(grelhaDeAssiduidade);

        // 5. Devolve o evento
        return eventoGravado;
    }
}
