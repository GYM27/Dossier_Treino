package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.Cargo;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

import com.dossiertreinador.domain.enums.Papel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

/**
 * Entidade que representa uma pessoa que usa o sistema (Treinadores, Médicos, etc).
 */
@Entity // Transforma esta classe numa tabela chamada 'utilizador' no Postgres
@Getter // Cria os métodos get()
@Setter // Cria os métodos set()
@NoArgsConstructor // Construtor vazio obrigatório para o Hibernate não se queixar
@AllArgsConstructor // Construtor completo obrigatório para o Padrão Builder funcionar
@Builder // Permite construir o utilizador com Utilizador.builder().nomeCompleto(...).build()
public class Utilizador implements UserDetails {

    @Id // Diz à base de dados: "Esta é a tua Chave Primária (PK)"
    @GeneratedValue(strategy = GenerationType.UUID) // Gera um UUID único automaticamente
    private UUID id;

    @NotBlank(message = "O nome não pode estar vazio.")
    @Column(nullable = false)
    private String nomeCompleto;

    // A anotação @Email garante que o texto tem mesmo o formato xxx@yyy.zzz
    // unique = true diz ao Postgres para proibir dois utilizadores com o mesmo email
    @NotBlank(message = "O email é obrigatório.")
    @Email(message = "Formato de email inválido.")
    @Column(nullable = false, unique = true)
    private String email;
    
    @NotBlank(message = "A password é obrigatória.")
    @Column(nullable = false)
    private String passwordHash;
    
    @NotNull(message = "O papel do utilizador é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Papel papel;

    // Como o 'Cargo' é um Enum no Java, a base de dados SQL não saberia lidar com ele diretamente.
    // @Enumerated(EnumType.STRING) diz ao Hibernate para gravar o NOME (ex: "TREINADOR_PRINCIPAL") na tabela
    // em vez do número da sua posição no enum (0, 1, 2...). Isto torna a tabela muito mais fácil de ler para humanos!
    @NotNull(message = "O cargo é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Cargo cargo;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + papel.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email; // Usamos o email como identificador principal
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
