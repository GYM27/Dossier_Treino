package com.dossiertreinador.security;

import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Papel;
import com.dossiertreinador.repository.EquipaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Serviço de Segurança para Validação de Controlo de Acesso ao Nível do Objeto (Anti-IDOR / BOLA).
 * Permite verificar se o utilizador atualmente autenticado tem permissão para ler ou manipular 
 * recursos pertencentes a uma determinada equipa.
 */
@Service("equipaSecurityService")
@RequiredArgsConstructor
public class EquipaSecurityService {

    private final EquipaRepository equipaRepository;

    /**
     * Valida se a autenticação atual possui permissão de acesso à equipa informada.
     *
     * @param authentication Dados de autenticação extraídos do SecurityContext
     * @param equipaId       Identificador único da equipa
     * @return true se o utilizador for autorizado, false caso contrário
     */
    public boolean temAcessoAEquipa(Authentication authentication, UUID equipaId) {
        if (authentication == null || !authentication.isAuthenticated() || equipaId == null) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Utilizador utilizador)) {
            return false;
        }

        // 1. Administradores têm acesso universal a todos os escalões
        if (utilizador.getPapel() == Papel.ADMINISTRADOR) {
            return true;
        }

        // 2. Verificar se a equipa existe na base de dados
        return equipaRepository.findById(equipaId).isPresent();
    }
}
