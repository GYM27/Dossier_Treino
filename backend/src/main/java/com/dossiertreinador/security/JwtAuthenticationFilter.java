package com.dossiertreinador.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        // 1. Verificar se o token vem no Header Authorization (Bearer token)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            // 2. Se não estiver no header, tentar ler do Cookie (para maior segurança web)
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        // Se não houver JWT, passa para o próximo filtro (que provavelmente bloqueará o pedido)
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Tentar extrair o email do token (se o token for inválido, isto vai rebentar - tratar no ExceptionHandler depois)
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        // Se encontrou o email e o utilizador ainda não está autenticado no contexto atual
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validar o token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Gravar no contexto de segurança (O Spring agora confia nesta sessão)
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (org.springframework.security.core.userdetails.UsernameNotFoundException ex) {
                // Se o utilizador já não existir na BD, ignorar o token
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
