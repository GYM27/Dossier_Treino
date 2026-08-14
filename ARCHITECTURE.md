# Arquitetura e DecisÃµes TÃ©cnicas: Dossier do Treinador

Este documento Ã© o nosso "diÃ¡rio de bordo" de Engenharia de Software. Aqui registamos a evoluÃ§Ã£o da arquitetura e as justificaÃ§Ãµes tÃ©cnicas do projeto, escrito numa Ã³tica de aprendizagem passo-a-passo.

---

## Fase 1: Scaffolding e Assiduidade

### Etapa 1: Scaffolding (ConfiguraÃ§Ã£o Inicial)

#### O Ficheiro pom.xml
- **O que Ã©:** O coraÃ§Ã£o do nosso projeto Maven, responsÃ¡vel por gerir as bibliotecas (dependÃªncias) que usamos.
- **Java 21:** Escolhemos usar Java 21 por ser a versÃ£o LTS (Long Term Support) mais recente e robusta.
- **Starters do Spring Boot:** Usamos os `spring-boot-starter-*` para importar mÃ³dulos inteiros (como `Web`, `Data JPA` e `Validation`) de forma fÃ¡cil, sem nos preocuparmos com incompatibilidades entre as centenas de sub-bibliotecas que os compÃµem.
- **Lombok:** Adicionado para remover cÃ³digo repetitivo e maÃ§udo ("boilerplate") como getters, setters e construtores. MantÃ©m os ficheiros pequenos e fÃ¡ceis de ler.
- **Bases de Dados MÃºltiplas:** 
  - `postgresql`: Para correr a aplicaÃ§Ã£o em ambiente de desenvolvimento real e produÃ§Ã£o.
  - `h2`: Base de dados em memÃ³ria configurada com `scope="test"`. Isto significa que a H2 sÃ³ "nasce" e "morre" quando corremos os nossos testes (TDD), permitindo testar o acesso a dados numa fraÃ§Ã£o de segundo, sem afetar os dados reais.

### PadrÃ£o de Arquitetura em Camadas (Clean Architecture Simplificada)
Durante a Fase 1, implementÃ¡mos o padrÃ£o industrial para aplicaÃ§Ãµes Java Spring Boot:
1. **Entidades (`entities/`)**: Classes que mapeiam 1-para-1 com as tabelas da BD atravÃ©s do Hibernate. TÃªm restriÃ§Ãµes nativas do Java (`@Past`, `@Max`) para garantir integridade.
2. **RepositÃ³rios (`repository/`)**: Interfaces MÃ¡gicas do Spring Data JPA. Com uma simples assinatura de mÃ©todo (`findByEquipaId`), o Spring gera o SQL. Para queries complexas, usamos JPQL (`@Query`).
3. **ServiÃ§os (`service/` e `impl/`)**: Ã‰ o cÃ©rebro da aplicaÃ§Ã£o. SeparÃ¡mos as Interfaces das ImplementaÃ§Ãµes para desacoplar a lÃ³gica (O "Menu" vs a "Cozinha"). Ã‰ aqui que agrupamos aÃ§Ãµes como `registarEventoEGerarGrelha` e as protegemos com `@Transactional` para evitar dados corrompidos.
4. **DTOs (`dtos/`) e Mappers (`mappers/`)**: Nunca expomos as Entidades Ã  Internet. Usamos Mappers (`@Component`) para converter os pesados objetos de Base de Dados em leves "Envelopes Seguros" (DTOs) com campos calculados (como a Idade).
5. **Controladores (`controller/`)**: A "Porta da Rua". Usam `@RestController` para apanhar os pedidos HTTP (JSON) e passÃ¡-los aos ServiÃ§os.
6. **ExceÃ§Ãµes Globais (`exceptions/`)**: O `@ControllerAdvice` atua como um pÃ¡ra-quedas geral, intercetando todos os erros atirados pelos repositÃ³rios e serviÃ§os, e formatando-os num `ErrorResponse` em JSON (cÃ³digo HTTP 400).

### EstratÃ©gia de Testes (TDD Rigoroso)
- **RepositÃ³rios (`@DataJpaTest`)**: Testados contra a H2. Provou que regras como a nÃ£o duplicaÃ§Ã£o de assiduidades (graÃ§as Ã  `@UniqueConstraint`) bloqueiam efetivamente falhas no SQL.
- **ServiÃ§os (Mockito)**: Testados com `@Mock` e `@InjectMocks` sem base de dados. O uso do `ArgumentCaptor` permitiu testar a complexa lÃ³gica do Batch Insert interceptando a lista em pleno voo.
- **Controladores (`@WebMvcTest`)**: Testados simulando chamadas HTTP `POST` sem levantar um servidor de verdade, com a ferramenta fantÃ¡stica do `MockMvc`.

### Etapa 12: Segurança - Autenticação & Autorização
- **Design Pattern / Arquitetura**: Separação de Contextos de Segurança (Security Config, Filters e JWT Service).
- **Decisão**: Extraímos a criação de beans (PasswordEncoder, UserDetailsService, AuthenticationManager) para uma ApplicationConfig para evitar ciclos de dependência (UnsatisfiedDependencyException), uma vez que SecurityConfig dependia do filtro, e o filtro de beans que seriam instanciados no próprio SecurityConfig.
- **Segurança Stateless**: Não usamos sessões de servidor (Cookies tradicionais JSESSIONID). Em vez disso usamos SessionCreationPolicy.STATELESS com JWT intercetado a cada pedido.
- **Testabilidade**: Os testes unitários de Controller excluem a stack de segurança (usando @AutoConfigureMockMvc(addFilters = false)) para isolar os componentes. Apenas os Testes de Integração (SecurityIntegrationTest.java) levantam o contexto de Segurança completo.

### Etapa 12.1: Revisão de Cibersegurança
- **XSS Prevention (Cookies)**: O JWT deixou de ser enviado no corpo da resposta (JSON) e passou a ser injetado diretamente num cookie HTTPOnly, Secure e SameSite=Strict.
- **Role-Based Access Control (RBAC)**: O endpoint de registo foi removido da whitelist e requer agora autenticação com papel de ADMINISTRADOR ou TREINADOR.
- **Tratamento de Exceções de Segurança**: O Spring Security foi configurado com um JwtAuthenticationEntryPoint para devolver corretamente 401 Unauthorized em vez de 403 Forbidden em acessos não autenticados, enquanto o GlobalExceptionHandler captura credenciais incorretas.
- **Testes Unitários com Segurança**: O @AutoConfigureMockMvc(addFilters = false) foi removido. Os filtros de segurança são ativados nos testes de Controller e a autenticação é simulada via @WithMockUser, forçando a verificação real das anotações @PreAuthorize.

### Etapa 13: Integração Frontend ↔ Backend
- **CORS Seguro**: Foi configurado o CorsConfigurationSource no Spring Security para permitir chamadas do localhost:3000 suportando a flag llowCredentials=true, o que possibilita o tráfego do JWT HttpOnly Cookie.
- **Segurança no Next.js**: Foi criado o utilitário estrito pi.ts que força a flag credentials: 'include' em todos os pedidos e processa eventuais 401 Unauthorized.
- **Proteção de Rotas**: Adicionado o middleware.ts do Next.js. O sistema agora avalia de imediato a presença do cookie jwt na rota e protege o dashboard (Client-side & Server-side protection).
- **Data Fetching (Plantel)**: O componente 
oster-view.tsx foi migrado para ler do backend os Atletas criados na Base de Dados, substituindo os dados mock.

### Etapa 14: Gestão do Plano de Treino
- **Arquitetura Relacional com Catálogo**: Em vez de se escrever o nome do exercício em cada sessão, criou-se a entidade Exercicio (Catálogo global) e a entidade SessaoTreino.
- **Associação Rica (SessaoTreinoExercicio)**: A ligação @OneToMany foi enriquecida para conter atributos específicos do contexto do treino, como ordem, duracaoMinutos e observacoesDoTreinador.
- **Auditoria e RGPD**: O catálogo de exercícios e as sessões estão auditados pelo AuditingEntityListener.

### Etapa 15: O Padrão "Container/Presenter" e Fetching no Dashboard
- **Separação de Preocupações**: A comunicação com a API (fetch, cabeçalhos, tratamento de erros HTTP) foi encapsulada no ficheiro estrito `api.ts`. O componente UI (`dashboard-view.tsx`) agora age apenas como consumidor, mantendo-se agnóstico à lógica de rede.
- **Tipagem Estrita**: Os DTOs do backend são espelhados em TypeScript Interfaces no frontend, ativando early-catch de bugs durante a transpilação em vez de causar erros de runtime no browser.
- **Processamento no Cliente vs Servidor**: Em vez de pedir ao backend a "contagem de defesas", pedimos a lista de atletas inteira (um só pedido REST) e fazemos cálculos de filtragem in-memory no frontend usando `.filter()`. É um *trade-off* adequado para listas pequenas (como plantéis de 25-30 pessoas) reduzindo a carga do servidor de base de dados.

### Etapa 15.1: Clean Code no Frontend (Nomenclatura Descritiva)
- **Conven��es de Nomes:** Adot�mos uma abordagem rigorosa onde os componentes de layout partilhados usam ingl�s estrutural t�cnico (sidebar, 	op-header), enquanto que os ecr�s que representam dom�nios de neg�cio s�o nomeados de forma identificativa e clara (squad, dashboard, ttendance).
- **Remo��o de Sufixos:** Foram removidos sufixos de contexto gen�ricos (como -view) gerados automaticamente, promovendo a simplicidade e evitando ru�do visual no c�digo.

---
### Atualização: O Meu Perfil e Configurações (Fase 2)
- **Decisão Arquitetural**: Separação visual das configurações por "Abas" em vez de múltiplas páginas independentes.
- **Porquê**: Reduz a complexidade de navegação e mantém todas as lógicas de gestão administrativa aglomeradas num único "hub" (`settings.tsx`).
- **Padrões de Desenho**: Injeção de Dependências no Spring (`@AuthenticationPrincipal`) para garantir que o contexto de segurança (Security Context) dita quem é o ator da ação (Autorização baseada em Token), eliminando verificações manuais de ID no service layer.

## Assiduidade e Centro de Controlo

- **Design Pattern / UX**: Optou-se por uma **Matriz (Grelha Semanal)** em vez de uma vis�o isolada por evento. Isto permite ao treinador observar imediatamente os padr�es da semana, ver les�es recorrentes ou gerir de forma mais hol�stica.
- **Efici�ncia de Rede**: O Backend devolve uma lista de DTOs achatada (flat) e o frontend agrupa os dados usando a estrutura da matriz e a mem�ria (React useMemo).
- **Update Otimista**: Na UI (Attendance.tsx), quando se clica num estado (ex: PRESENTE -> AUSENTE), a mudan�a � refletida imediatamente na vista (para ser r�pida) e, em background, faz a chamada PUT � API. Se falhar, � feito o 'rollback' e � mostrado erro.


### Calendar Synchronization (iCal) - Security Bypass
- **Decisão:** Permitir acesso anónimo ao endpoint /api/eventos/equipa/*/ical.
- **Justificação:** Clientes de calendário não suportam autenticação JWT. A segurança baseia-se na obscuridade do ID da Equipa (UUID) que funciona como um *capability URL*.

### Calendar Synchronization (iCal) - Security Bypass
- **Decisão:** Permitir acesso anónimo ao endpoint /api/eventos/equipa/*/ical.
- **Justificação:** Clientes de calendário não suportam autenticação JWT. A segurança baseia-se na obscuridade do ID da Equipa (UUID) que funciona como um *capability URL*.

### Registo de Assiduidade Dinâmico (Upsert)
- **Problema:** Jogadores inseridos à posteriori não tinham instâncias de RegistoAssiduidade nos eventos já criados.
- **Solução:** Implementação de um padrão UPSERT na API (PUT por ID de Evento e ID de Atleta) para resolver missing records de forma lazy (só cria quando o treinador clica para registar falta/presença).

### Fotografia do Atleta (URL-based)
- **Problema:** Necessidade de identificação visual rápida nas grelhas.
- **Solução:** Adição de propriedade `fotoUrl` (String) à entidade Atleta. Optou-se por guardar o URL absoluto para simplificar a infraestrutura, mantendo o Frontend responsável por renderizar a tag `<img>` com fallbacks visuais adequados (Avatar com iniciais).


## M�dulo de Treinos (Treino Builder)
O design de ecr� inteiro exigiu que a arquitetura do Frontend isolasse o TreinoBuilderStitch dos layouts gen�ricos. O Backend foi flexibilizado para incluir colunas da Periodiza��o T�tica (morfociclo, microciclo, ase). A separa��o entre o Orquestrador (TreinosOrchestrator) e a visualiza��o (TreinoBuilderStitch) mant�m a componente de apresenta��o (UI rica com Tailwind custom colors) desligada da mec�nica de fetching das listas base.

 # # #   I n t e g r a � � o   d a   P r a n c h e t a   T � t i c a 
 A   a r q u i t e t u r a   d o   T r e i n o   B u i l d e r   f o i   e x p a n d i d a   p a r a   s u p o r t a r   c r i a � � o   e   a s s o c i a � � o   d i r e t a   d e   e x e r c � c i o s . 
 A   e n t i d a d e   \ E x e r c i c i o \   u t i l i z a   \ @ J d b c T y p e C o d e ( S q l T y p e s . J S O N ) \   n o   c a m p o   \ d a d o s T a t i c o s \   p a r a   p e r s i s t i r   o   e s t a d o   d o   C a n v a s   ( p o s i � � e s   X , Y   e   l i n h a s )   d e   f o r m a   s c h e m a - l e s s ,   g a r a n t i n d o   f l e x i b i l i d a d e   c a s o   o s   r e q u i s i t o s   d o   d e s e n h o   t � t i c o   e v o l u a m .   A   c o m u n i c a � � o   �   f e i t a   v i a   \ P O S T   / a p i / e x e r c i c i o s \   ( C r i a � � o   g l o b a l )   s e g u i d o   d e   \ P O S T   / a p i / t r e i n o s / { s e s s a o I d } / e x e r c i c i o s \   ( A s s o c i a � � o   a o   T r e i n o   A t u a l ) .  
 


## Prancheta Tática (Tactical Board) - Arquitetura e Decisões de Engenharia

### 1. Separação de Responsabilidades e Componentização
- **Padrão Orquestrador / Apresentação**:
  - TacticalBoard.tsx gere o motor Canvas, render loop a 60fps e sincronização de eventos de ponteiro/teclado.
  - TacticalBottomBar.tsx é responsável pelas ferramentas globais e controlos de modo.
  - TacticalSidebar.tsx gere os metadados do exercício e operações de persistência e histórico.
  - TacticalShapeFloatingBar.tsx fornece edição contextual direta (in-place) sobre os objetos no campo.

### 2. Sincronização entre Ciclo React e Canvas Loop (Prevenção de Stale Closures)
- **Problema**: O render loop do Canvas executado em equestAnimationFrame dentro de um useEffect com dependências vazias mantinha referências antigas (*stale closures*) a variáveis de estado do React como selectedDrawingIdx.
- **Solução Arquitetural**: Implementado o padrão de estado emparelhado com referências (selectedDrawingIdxRef e selectedElementIdRef). Todas as mutações de seleção atualizam simultaneamente a referência síncrona e o estado do React, permitindo que o loop gráfico leia em tempo real as seleções sem exigir a reinicialização do loop do canvas.

### 3. Floating Toolbar com Dimensões Constantes (UX Invariante)
- **Decisão**: A barra de edição flutuante foi dimensionada para uma largura fixa de 380px com uma grelha de duas linhas invariante.
- **Justificação**: Evita o fenómeno de *layout shift* (salto visual brusco) quando o utilizador transita a seleção entre formas geométricas (com preenchimento e opacidade) e linhas/setas táticas.

### 4. Renderização Vetorial 3D da Bola e Auras de Destaque
- **Decisão**: Implementar a bola de futebol e as auras luminosas diretamente em instruções vetoriais do Canvas 2D (createRadialGradient, ellipse, shadowBlur, clip).
- **Justificação**: Elimina a necessidade de assets de imagem externos ou requisições HTTP adicionais, assegurando renderização nítida em qualquer resolução e escala sem artefactos de compressão.


## Atalhos de Teclado Universais: Desfazer (Ctrl+Z) e Refazer (Ctrl+Y / Ctrl+Shift+Z)

### 1. Implementação Técnica
- Adicionado intercetor de eventos de teclado no TacticalBoard.tsx:
  - (e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey: Executa undo(), revertendo para o snapshot de estado anterior na pilha de histórico.
  - (e.ctrlKey || e.metaKey) && e.key === "y" ou Ctrl+Shift+Z: Executa edo(), avançando para o estado seguinte na pilha.
  - Proteção contextual: Se o foco estiver num input, 	extarea, select ou campo editável, os atalhos não interferem com a edição nativa de texto.


## Atalhos de Teclado Universais: Copiar (Ctrl+C) e Colar (Ctrl+V) de Desenhos e Elementos

### 1. Implementação Técnica do Clipboard
- Adicionada a referência em memória clipboardRef no TacticalBoard.tsx.
- **Copiar (Ctrl+C / Cmd+C)**:
  - Se estiver selecionada uma forma ou linha (selectedDrawingIdxRef.current), clona em profundidade as propriedades geométricas e de estilo (points, color, illColor, size, opacity, lineStyle).
  - Se estiver selecionado um jogador, cone ou bola (selectedElementIdRef.current), clona as propriedades do elemento.
- **Colar (Ctrl+V / Cmd+V)**:
  - **Para Desenhos/Formas**: Aplica um ligeiro deslocamento (*offset*) de +25px nas coordenadas X e Y (para que a cópia não fique perfeitamente sobreposta e seja imediatamente visível), insere na lista de desenhos, seleciona a nova cópia e grava no histórico (*Undo*).
  - **Para Jogadores/Peças**: Cria um novo identificador único (id), atribui o próximo dorsal vago (se for jogador da Equipa A ou B), aplica o deslocamento de +25px, insere no quadro e seleciona a nova peça.
## Relvado Tático, Balizas Móveis (Mini, Fut 7, Fut 11) e Jogadores Customizáveis

### 1. 3 Modos de Relvado (Full | Half | Free)
- **Full**: Campo completo com 2 balizas e áreas regulamentares.
- **Half**: Meio-campo tático com grande área, pequena área, penálti e meia-lua à esquerda, e linha de meio-campo com meio-círculo central à direita.
- **Free**: Relvado limpo sem marcações interiores, concebido para rondos e jogos em espaço reduzido.

### 2. Balizas Móveis com Dimensões Reais
- **Mini**: 36x18px para jogos de precisão e transição rápida.
- **Fut 7**: 56x24px com proporções de futebol de 7 (6x2m).
- **Fut 11**: 82x32px com proporções regulamentares de futebol de 11 (7.32x2.44m).
- **Rotação**: Suporte a 360° através da barra contextual e da tecla 'R'.

### 3. Personalização de Jogadores (Tamanho, Cores e Siglas)
- **3 Escalas**: Pequeno (sm - 11px), Médio (md - 15px), Grande (lg - 19px).
- **Cores & Coletes**: 7 cores predefinidas + seletor livre para equipas adicionais, neutros e coringas.
- **Siglas & Nomes**: Suporte a texto arbitrário ('GR', 'C', 'MC', '7') com tipografia vetorial auto-escalável e cálculo automático de contraste (fundo claro vs escuro).

### 4. Robustez de Interação (Pointer Capture)
- Implementação de setPointerCapture no <canvas> para evitar interrupções de arrasto quando o cursor cruza os limites das barras de ferramentas flutuantes.
