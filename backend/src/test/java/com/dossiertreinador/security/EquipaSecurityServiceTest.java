package com.dossiertreinador.security;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import com.dossiertreinador.repository.EquipaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipaSecurityServiceTest {

    @Mock
    private EquipaRepository equipaRepository;

    @InjectMocks
    private EquipaSecurityService equipaSecurityService;

    private UUID equipaId;
    private Equipa equipa;

    @BeforeEach
    void setUp() {
        equipaId = UUID.randomUUID();
        equipa = Equipa.builder()
                .id(equipaId)
                .nome("Futebol Clube de Exemplo")
                .escalao("Seniores")
                .build();
    }

    @Test
    @DisplayName("Deve autorizar quando o utilizador é ADMINISTRADOR")
    void deveAutorizarParaAdministrador() {
        Utilizador admin = Utilizador.builder()
                .id(UUID.randomUUID())
                .email("admin@clube.pt")
                .nomeCompleto("Admin Geral")
                .papel(Papel.ADMINISTRADOR)
                .cargo(Cargo.DIRETOR_DESPORTIVO)
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                admin, null, List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR")));

        boolean temAcesso = equipaSecurityService.temAcessoAEquipa(auth, equipaId);

        assertTrue(temAcesso, "Administradores devem ter acesso a todas as equipas");
    }

    @Test
    @DisplayName("Deve autorizar quando o treinador está autenticado e a equipa existe")
    void deveAutorizarParaTreinadorComEquipaExistente() {
        when(equipaRepository.findById(equipaId)).thenReturn(Optional.of(equipa));

        Utilizador treinador = Utilizador.builder()
                .id(UUID.randomUUID())
                .email("treinador@clube.pt")
                .nomeCompleto("Treinador Principal")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                treinador, null, List.of(new SimpleGrantedAuthority("ROLE_TREINADOR")));

        boolean temAcesso = equipaSecurityService.temAcessoAEquipa(auth, equipaId);

        assertTrue(temAcesso, "Treinador autenticado deve ter acesso à equipa válida");
    }

    @Test
    @DisplayName("Deve rejeitar quando a autenticação for nula ou anónima")
    void deveRejeitarParaAutenticacaoNula() {
        boolean temAcesso = equipaSecurityService.temAcessoAEquipa(null, equipaId);
        assertFalse(temAcesso, "Pedidos não autenticados devem ser bloqueados");
    }

    @Test
    @DisplayName("Deve rejeitar quando a equipa não existe na base de dados")
    void deveRejeitarQuandoEquipaNaoExiste() {
        when(equipaRepository.findById(equipaId)).thenReturn(Optional.empty());

        Utilizador treinador = Utilizador.builder()
                .id(UUID.randomUUID())
                .email("treinador@clube.pt")
                .nomeCompleto("Treinador Principal")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                treinador, null, List.of(new SimpleGrantedAuthority("ROLE_TREINADOR")));

        boolean temAcesso = equipaSecurityService.temAcessoAEquipa(auth, equipaId);

        assertFalse(temAcesso, "Não deve autorizar acesso a equipa inexistente");
    }
}
