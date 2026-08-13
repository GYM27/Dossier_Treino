package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Atleta;

/**
 * Em Engenharia de Software robusta (Clean Architecture), o Service é primeiro criado
 * como uma Interface. Isto é um "contrato". Diz ao resto do sistema: 
 * "Eu garanto que existe um serviço que consegue registar um atleta, mas não 
 * tens de saber *como* ele o faz por detrás dos panos".
 */
public interface AtletaService {
    
    // O contrato diz apenas que recebemos um Atleta e devolvemos um Atleta
    Atleta registarNovoAtleta(Atleta atleta);
    
    java.util.List<Atleta> listarTodos();

    java.util.List<Atleta> listarPorEquipa(java.util.UUID equipaId);
}
