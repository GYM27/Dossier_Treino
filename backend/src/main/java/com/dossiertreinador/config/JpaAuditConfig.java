package com.dossiertreinador.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

/**
 * Esta classe é o "interruptor" que liga a Auditoria Automática do JPA.
 *
 * Sem @EnableJpaAuditing, os campos @CreatedBy e @LastModifiedBy
 * da nossa entidade Lesao ficariam sempre vazios (null).
 *
 * O método auditorProvider() diz ao Spring QUEM é o utilizador atual.
 * Por agora (antes da Etapa 12 de Autenticação), devolvemos "SISTEMA".
 * Quando implementarmos o Spring Security, este método vai ler o nome
 * do utilizador autenticado a partir do SecurityContext (o cofre de segurança).
 */
@Configuration
@EnableJpaAuditing // O interruptor mágico!
public class JpaAuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        // TODO (Etapa 12): Substituir por SecurityContextHolder.getContext()
        //                    .getAuthentication().getName()
        // Por agora, antes de termos Login, usamos um valor fixo.
        return () -> Optional.of("SISTEMA");
    }
}
