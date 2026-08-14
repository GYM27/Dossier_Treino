package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.RegistoAssiduidade;
import com.dossiertreinador.domain.enums.TipoAssiduidade;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.RegistoAssiduidadeRepository;
import com.dossiertreinador.repository.SessaoTreinoRepository;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.enums.TipoEvento;
import com.dossiertreinador.service.EventoCalendarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
public class EventoCalendarioServiceImpl implements EventoCalendarioService {

    private final EventoCalendarioRepository eventoRepository;
    private final AtletaRepository atletaRepository;
    private final RegistoAssiduidadeRepository registoRepository;
    private final SessaoTreinoRepository sessaoTreinoRepository;

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

        // 5. Criar Sessão de Treino Vazia se for um Treino
        if (eventoGravado.getTipoEvento() == TipoEvento.TREINO) {
            SessaoTreino novaSessao = SessaoTreino.builder()
                    .eventoCalendario(eventoGravado)
                    .equipa(eventoGravado.getEquipa())
                    .numeroJogadores(atletasDaEquipa.size()) // Pré-preencher com base na convocatória geral (assiduidade)
                    .duracaoTotalMinutos(0)
                    .build();
            sessaoTreinoRepository.save(novaSessao);
        }

        // 6. Devolve o evento
        return eventoGravado;
    }
    
    @Override
    public List<EventoCalendario> listarEventosDaSemana(UUID equipaId, LocalDateTime start, LocalDateTime end) {
        return eventoRepository.findByEquipaIdAndDataHoraInicioBetweenOrderByDataHoraInicioAsc(equipaId, start, end);
    }
    
    @Override
    @Transactional
    public EventoCalendario atualizarEvento(UUID eventoId, EventoCalendario eventoAtualizado) {
        EventoCalendario evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
                
        evento.setTipoEvento(eventoAtualizado.getTipoEvento());
        evento.setDataHoraInicio(eventoAtualizado.getDataHoraInicio());
        evento.setDataHoraFim(eventoAtualizado.getDataHoraFim());
        evento.setDescricao(eventoAtualizado.getDescricao());
        evento.setLocal(eventoAtualizado.getLocal());
        evento.setNumeroTreino(eventoAtualizado.getNumeroTreino());
        evento.setEquipaCasa(eventoAtualizado.getEquipaCasa());
        evento.setEquipaFora(eventoAtualizado.getEquipaFora());
        
        return eventoRepository.save(evento);
    }
    
    @Override
    @Transactional
    public void eliminarEvento(UUID eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new EntityNotFoundException("Evento não encontrado");
        }
        
        // 1. Remove child records (RegistoAssiduidade) first
        registoRepository.deleteByEventoId(eventoId);

        // 2. Remove associated SessaoTreino (se existir) to prevent Foreign Key Violation
        sessaoTreinoRepository.deleteByEventoCalendarioId(eventoId);
        
        // 3. Remove parent EventoCalendario
        eventoRepository.deleteById(eventoId);
    }
    
    @Override
    public Integer obterUltimoNumeroTreino(UUID equipaId) {
        return eventoRepository.findTopByEquipaIdAndTipoEventoOrderByDataHoraInicioDesc(equipaId, com.dossiertreinador.domain.enums.TipoEvento.TREINO)
                .map(EventoCalendario::getNumeroTreino)
                .orElse(0);
    }
}
