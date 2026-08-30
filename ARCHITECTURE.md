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

### 5. Melhorias de UI/UX no Tactical Builder
- **Hit Testing Híbrido para Formas**: Implementou-se um algoritmo simplificado de deteção 2D no TacticalBoard.tsx que permite agarrar formas (retângulos, círculos, triângulos) clicando em qualquer parte do interior ou nos bordos da linha.
- **Auto-Foco**: A injeção da propriedade utoFocus em barras de propriedades dinâmicas otimiza o fluxo de edição rápido sem necessidade de re-focar o rato.

### 8. Rotação Universal em Geometrias e Balizas
- **Hit-Testing com Matrizes Inversas**: A deteção de clique (isHit) e colisão com as *bounding boxes* das formas geométricas (Retângulo, Círculo, etc.) e das balizas foi atualizada. Agora, antes do teste matemático, aplicamos uma matriz de translação e rotação inversa (Math.cos(-rotation)) às coordenadas brutas do rato para o mapear para o espaço local (*unrotated space*) do objeto. Isto permite selecionar, arrastar e redimensionar objetos com ângulos complexos sem falhas na precisão.
- **Rendering Otimizado**: As formas passam a ser desenhadas no centro da sua *bounding box* através de uma combinação de ctx.translate e ctx.rotate, em vez de recalcular matematicamente os vértices poligonais de cada forma.

### 9. Módulo de Treinos - Arquitetura Estúdio / Master-Detail
- **Separação de Responsabilidades (Master-Detail)**: A página de Treinos foi refatorizada para o padrão Master-Detail. O componente TreinosOrchestrator coordena o estado entre a barra lateral (TreinosSidebarList), o estúdio de edição (TreinoDetailStudio) e o modal de criação rápida (NovoTreinoModal).
- **Sincronização Atómica de DTOs (Calendário \u0026 Treinos)**: Ao criar um treino, são criadas sequencialmente as entidades EventoCalendario (através de POST /api/eventos/equipa/{equipaId}) e SessaoTreino vinculada (através de POST /api/treinos), garantindo que o planeamento semanal no calendário e o caderno de exercícios partilham uma única fonte da verdade.
- **Integração Bidirecional de Exercícios**: O utilizador pode anexar exercícios ao treino de duas formas:
  1. Catálogo Existente (CatalogoExerciciosModal via /api/exercicios).
  2. Criação Imediata via Prancheta (NovoExercicioPranchetaModal via TacticalBoard), que regista o exercício no catálogo global e anexa-o instantaneamente à timeline da sessão (POST /api/treinos/{sessaoId}/exercicios).

### 10. Gestão do Catálogo de Exercícios - Edição, Duplicação e Eliminação
- **Endpoints RESTful para Exercícios**: Foram adicionados os endpoints PUT /api/exercicios/{id} para atualização de dados/prancheta e DELETE /api/exercicios/{id} para remoção segura de exercícios obsoletos.
- **Padrão Clone-on-Edit (Duplicação Segura)**: A interface de edição (NovoExercicioPranchetaModal) deteta se o utilizador alterou o nome do exercício em relação ao original. Se o nome for alterado ou o utilizador clicar explicitamente em **"Gravar como Novo"**, o frontend efetua um POST /api/exercicios criando uma nova entrada no catálogo e preservando o exercício original intacto. Se mantiver o nome original e clicar em **"Atualizar Original"**, o sistema executa um PUT /api/exercicios/{id}.

### P�gina de Treinos e Biblioteca (Update)
- **Read/Edit Mode Toggle**: O componente \TreinoDetailStudio\ implementa um padr�o de visualiza��o dual (Read/Edit). Isto melhora a legibilidade durante a sess�o e protege os dados contra edi��es acidentais.
- **Smart Duplication (Biblioteca)**: O \NovoExercicioPranchetaModal\ verifica o \hasNameChanged\. Se alterado durante a edi��o, encaminha o request para um POST (novo) em vez de PUT (update), preservando o exerc�cio original.
- **Transactional Boundary**: Adicionada a anota��o \@Transactional\ na classe \SessaoTreinoController\ (Backend). Isto evita a \LazyInitializationException\ durante a serializa��o do DTO de resposta da API na cria��o do Treino.


## Padronização Visual e Design System Frontend (Fase 1)

### 1. Camada de UI Primitiva (components/ui/)
- Centralização de componentes atómicos reutilizáveis (Button, Input, Badge, Card, Textarea).
- Utilização de class-variance-authority (CVA) para variantes declarativas e tipadas.
- Aplicação de cn() (clsx + tailwind-merge) para resolução determinística de estilos e eliminação de duplicação de classes Tailwind hardcoded.

### 2. Refatoração e Padronização por Módulos
- **Treinos**: Formulários de criação (NovoTreinoModal), estúdio detalhado (TreinoDetailStudio) e cartões de exercícios da timeline (TreinoExercicioCard) usam exclusivamente o Design System.
- **Plantel**: AtletaFormModal migrado para Input e Button padronizados.
- **Calendário**: EventoFormModal alinhado com validação robusta de datas e inputs controlados.

### 6. Geometria Anal�tica para Rota��o de Linhas
- **Rotate Handle Offset**: Implementa��o de um manipulador de rota��o espacial puro para linhas retas. O c�lculo do pivot usa trigonometria (Math.atan2 com offset perpendicular de Math.PI / 2) para projetar o *handle* e atualizar a inclina��o mantendo Math.hypot e o centro geom�trico (cx, cy) imut�veis.

### 7. Normaliza��o de Espa�amentos da UI
- **Global Y-Offset**: A margem de respiro vertical para todos os menus contextuais flutuantes (Jogadores, Balizas, Formas Geom�tricas, Linhas) foi uniformizada globalmente atrav�s da propriedade CSS 	ranslateY(-40px). Esta abordagem garante uma folga visual consistente em toda a plataforma, sem afetar o c�lculo subjacente dos *bounding boxes* para sele��o.


## Camada de Serviços API Frontend (Fase 2)

### 1. Padrão Service Layer (rontend/services/)
- Isolamento total da comunicação HTTP e rotas da API em módulos de domínio independentes:
  - 	reinoService: Gestão do ciclo de vida das sessões de treino e composição de exercícios.
  - exercicioService: Catálogo de exercícios e persistência tática.
  - tletaService: Gestão do plantel e fichas de jogador.
  - calendarioService: Eventos de calendário e microciclos/morfociclos.
  - ssiduidadeService: Registo e consulta de assiduidade semanal/mensal.
- Centralização de tipos e contratos de dados nos serviços, evitando rotas hardcoded na camada de apresentação (React).

## Extração de Custom Hooks e Desacoplamento da Apresentação (Fase 3)

### 1. Padrão Container / Presentational & Custom Hooks
- Eliminação de componentes monolíticos superiores a 200 linhas:
  - components/calendario/: usePlaneamentoSemanal desacoplado em CalendarioHeader, CalendarioWeekView, CalendarioMonthView, CalendarioDayView.
  - components/treinos/: useTreinoDetailStudio desacoplado em TreinoStudioHeader, TreinoStudioMetadataForm, TreinoExercicioCard.
  - components/assiduidade/: useAttendance desacoplado em AttendanceHeader, AttendanceModal.
- Componentes React tornaram-se estritamente "dumb components", garantindo facilidade de manutenção e testes de interface isolados.

---

## Fase 4: Fragmentação de Componentes (Dividir para Conquistar)

### 1. Desmembramento de Modais e Isolação de Hooks Form (Novidade da Fase 4)
O objetivo foi reduzir ainda mais a complexidade dos componentes de modal ao aplicar o padrão de responsabilidade única:
- **`useEventoForm.ts`**: Hook customizado responsável por gerenciar todo o estado interno do formulário de eventos do calendário (`formData`, `duracao`, `localOption`, `availableTeams`, flags de equipas personalizadas, e lógica de inicialização).
- **`EventoFormEquipas.tsx`**: Sub-componente dedicado exclusivamente à renderização e interação dos seletores de equipa da casa e fora para eventos do tipo `JOGO`, encapsulando a lógica de alternância entre seleção de equipas existentes e criação de novas equipas.
- **`EventoFormModal.tsx`**: Reduzido a um componente "contentor" (dumb component) que apenas orquestra a apresentação visual e delegue a lógica para o `useEventoForm` e o `EventoFormEquipas`. Isso garante que o modal é simples, focado apenas em layout e eventos de save/cancel.

### 2. Arquitetura de Vistas Dedicadas no Calendário
O `PlaneamentoSemanal.tsx` mantém a arquitetura orquestradora pura:
- Consome apenas o hook `usePlaneamentoSemanal` e delega toda a renderização para sub-módulos totalmente independentes.
- **`CalendarioHeader.tsx`**: Controlos de navegação, troca de vista e morfociclos.
- **`CalendarioWeekView.tsx`**: Renderização da grelha de 7 dias com cards de eventos.
- **`CalendarioMonthView.tsx`**: Renderização mensal de 42 dias com scroll customizado.
- **`CalendarioDayView.tsx`**: Vista diária detalhada com horários.
- **`EventoFormModal.tsx`**: Modal de formulário de evento (refatorado com o hook `useEventoForm` e sub-componente `EventoFormEquipas`).
- **`CalendarioSyncModal.tsx`**: Modal de sincronização iCal isolado.

**Resultado**: Cada componente visual assume responsabilidade exclusiva sobre o seu domínio de renderização. Nenhum ficheiro da área de calendário excede os limites de complexidade, garantindo facilidade de teste unitário e prevenção de regressões visuais.

---

## Fase 5: Refatoramento da Prancheta Tática (O Desafio Final)

### 1. Desmembramento de Responsabilidades (Novidade da Fase 5)
O objetivo da Fase 5 era aplicar o padrão de separação de responsabilidades (SoC) ao `TacticalBoard.tsx`, dividindo a lógica em hooks especializados:

- **Motor Gráfico (`useTacticalCanvasRenderer.ts`)**: Responsável exclusivamente pela renderização da Canvas API - drawField, drawSingleDrawing, getDrawingBounds. Isola a lógica de desenho puro da componente visual.

- **Gestor de Interações (`useTacticalActions.ts`)**: Isola os eventos de rato, as teclas de atalho e a máquina de estados (operações de undo/redo) em um hook independente. Contém:
  - Gestão de histórico (saveStateToHistory, undo, redo)
  - Atalhos de teclado (Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Delete, Backspace, 'R' key)
  - Eventos de ponteiro e coordenadas de canvas
  - Área de transferência (clipboard) para copiar/colar elementos

### 2. Arquitetura Resultante
- **`TacticalBoard.tsx`**: Torna-se um componente "contentor" que orquestra a visualização, usando os hooks para state management e rendering.
- **`useTacticalCanvasRenderer.ts`**: Motor de desenho puro, receives stateRef e ctx, returns drawing functions.
  -  ssiduidadeService: Registo e consulta de assiduidade semanal/mensal.
- Centralização de tipos e contratos de dados nos serviços, evitando rotas hardcoded na camada de apresentação (React).

## Extração de Custom Hooks e Desacoplamento da Apresentação (Fase 3)

### 1. Padrão Container / Presentational & Custom Hooks
- Eliminação de componentes monolíticos superiores a 200 linhas:
  - components/calendario/: usePlaneamentoSemanal desacoplado em CalendarioHeader, CalendarioWeekView, CalendarioMonthView, CalendarioDayView.
  - components/treinos/: useTreinoDetailStudio desacoplado em TreinoStudioHeader, TreinoStudioMetadataForm, TreinoExercicioCard.
  - components/assiduidade/: useAttendance desacoplado em AttendanceHeader, AttendanceModal.
- Componentes React tornaram-se estritamente "dumb components", garantindo facilidade de manutenção e testes de interface isolados.

---

## Fase 4: Fragmentação de Componentes (Dividir para Conquistar)

### 1. Desmembramento de Modais e Isolação de Hooks Form (Novidade da Fase 4)
O objetivo foi reduzir ainda mais a complexidade dos componentes de modal ao aplicar o padrão de responsabilidade única:
- **`useEventoForm.ts`**: Hook customizado responsável por gerenciar todo o estado interno do formulário de eventos do calendário (`formData`, `duracao`, `localOption`, `availableTeams`, flags de equipas personalizadas, e lógica de inicialização).
- **`EventoFormEquipas.tsx`**: Sub-componente dedicado exclusivamente à renderização e interação dos seletores de equipa da casa e fora para eventos do tipo `JOGO`, encapsulando a lógica de alternância entre seleção de equipas existentes e criação de novas equipas.
- **`EventoFormModal.tsx`**: Reduzido a um componente "contentor" (dumb component) que apenas orquestra a apresentação visual e delegue a lógica para o `useEventoForm` e o `EventoFormEquipas`. Isso garante que o modal é simples, focado apenas em layout e eventos de save/cancel.

### 2. Arquitetura de Vistas Dedicadas no Calendário
O `PlaneamentoSemanal.tsx` mantém a arquitetura orquestradora pura:
- Consome apenas o hook `usePlaneamentoSemanal` e delega toda a renderização para sub-módulos totalmente independentes.
- **`CalendarioHeader.tsx`**: Controlos de navegação, troca de vista e morfociclos.
- **`CalendarioWeekView.tsx`**: Renderização da grelha de 7 dias com cards de eventos.
- **`CalendarioMonthView.tsx`**: Renderização mensal de 42 dias com scroll customizado.
- **`CalendarioDayView.tsx`**: Vista diária detalhada com horários.
- **`EventoFormModal.tsx`**: Modal de formulário de evento (refatorado com o hook `useEventoForm` e sub-componente `EventoFormEquipas`).
- **`CalendarioSyncModal.tsx`**: Modal de sincronização iCal isolado.

**Resultado**: Cada componente visual assume responsabilidade exclusiva sobre o seu domínio de renderização. Nenhum ficheiro da área de calendário excede os limites de complexidade, garantindo facilidade de teste unitário e prevenção de regressões visuais.

---

## Fase 5: Refatoramento da Prancheta Tática (O Desafio Final)

### 1. Desmembramento de Responsabilidades (Novidade da Fase 5)
O objetivo da Fase 5 era aplicar o padrão de separação de responsabilidades (SoC) ao `TacticalBoard.tsx`, dividindo a lógica em hooks especializados:

- **Motor Gráfico (`useTacticalCanvasRenderer.ts`)**: Responsável exclusivamente pela renderização da Canvas API - drawField, drawSingleDrawing, getDrawingBounds. Isola a lógica de desenho puro da componente visual.

- **Gestor de Interações (`useTacticalActions.ts`)**: Isola os eventos de rato, as teclas de atalho e a máquina de estados (operações de undo/redo) em um hook independente. Contém:
  - Gestão de histórico (saveStateToHistory, undo, redo)
  - Atalhos de teclado (Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Delete, Backspace, 'R' key)
  - Eventos de ponteiro e coordenadas de canvas
  - Área de transferência (clipboard) para copiar/colar elementos

### 2. Arquitetura Resultante
- **`TacticalBoard.tsx`**: Torna-se um componente "contentor" que orquestra a visualização, usando os hooks para state management e rendering.
- **`useTacticalCanvasRenderer.ts`**: Motor de desenho puro, receives stateRef e ctx, returns drawing functions.
- **`useTacticalActions.ts`**: Gerencia todo o estado interactivo e de histórico, retornando funções de ação e helpers.

**Desafio Técnico**: A integração completa enfrentou limitações com o bundler Turbopack na configuração atual, especificamente relacionados com conflitos de nomes de módulos e resolução de caminhos. A arquitetura em si é sólida e modular, mas requer ajustes de configuração ou nomenclatura para plena integração.

### 3. Próximas Etapas
- Resolver conflitos de nomenclatura entre hooks e componente
- Garantir renderização visual consistente após extração da lógica
- Verificar compatibilidade com todos os modos de relvado (Full/Half/Free)

---

## Fase 6: Separação Especializada de Páginas (Exercícios vs Planos de Treino vs Calendário)

### 1. Visão Geral e Princípio de Desenho (Single Responsibility Principle)
Eliminou-se a redundância de formulários de criação de treinos, separando a aplicação em três domínios funcionais claros:
- **Calendário**: Módulo de agendamento e logística temporal/espacial.
- **Planos de Treino**: Estúdio de estruturação técnica da sessão, pré-alimentado pelo agendamento do calendário.
- **Prancheta Tática**: Laboratório de criação, edição e gestão do catálogo de exercícios do clube.

### 2. Diagrama de Fluxo e Interação de Módulos
```
[📅 Calendário]
     │
     ├─► Agenda: Data, Hora, Local, Nº Treino
     │        │
     │        ▼
     │   (EventoCalendario + SessaoTreino no PostgreSQL)
     │        │
     └─► [⚡ Botão "Planear Treino"]
              │
              ▼
    [📋 Planos de Treino (TreinosOrchestrator)]
              │
              ├─► Pré-preenche Data, Hora, Local, Microciclo
              ├─► Define: Objetivo, Nº Atletas, Intensidade, Material
              └─► Importa Exercícios da Biblioteca ◄──────┐
                                                         │
    [🎨 Prancheta Tática (PranchetaStudio)] ─────────────┘
              │
              ├─► Desenho 2D no TacticalBoard (jogadores, setas, cones, balizas)
              ├─► Ficha Técnica (Nome, Categoria, Espaço, Dificuldade, Instruções)
              └─► Persiste no Catálogo Central (/api/exercicios)
```

### 3. Padrão DTO e Mapeamento de Transporte
- **`SessaoTreinoResponseDTO`**: Expandido com `local` e `eventoId` para eliminar consultas secundárias do frontend.
- **`SessaoTreinoMapper`**: Resolve a associação `@OneToOne` de `EventoCalendario` com segurança transacional.
- **Navegação com Estado**: O `app/page.tsx` gere o `selectedTreinoId`, permitindo transições fluidas e contextualizadas entre o Calendário e o Estúdio de Treino.

### 4. Padrão de Apresentação da Prancheta: Offcanvas Drawer & Horizontal CSS Grid
- **Offcanvas Drawer (Hambúrguer)**: O catálogo de exercícios (`PranchetaStudio`) foi convertido num painel retrátil posicionado fora do fluxo normal (`absolute z-50`), libertando 100% da largura horizontal do monitor para o canvas de desenho quando recolhido.
- **Horizontal CSS Grid (Ficha Técnica)**: Os metadados do exercício (Nome, Categoria, Espaço, Nº Atletas, Dificuldade, Objetivos) foram reorganizados num painel horizontal colapsável em grelha responsiva de 12 colunas, eliminando colunas verticais estáticas que espremiam o quadro tático.
- **Auto-Scaling Fluid Canvas (`TacticalBoard`)**: A prancheta preenche `100%` da área flexível do contentor pai (`w-full h-full min-h-0`), e o `TacticalSidebar` inicia minimizado (`w-12`), garantindo a máxima área útil visual para o treinador.

### 5. Segregação Estrita de Domínios (Eliminação de Duplicação)
- **Desacoplamento de Treinos e Prancheta**: Eliminou-se o modal duplicado de prancheta de dentro de `modules/treinos`. O módulo de treinos passa a atuar unicamente como orquestrador da sessão, importando exercícios existentes do catálogo através do `CatalogoExerciciosModal`. A criação e modelação tática é centralizada com exclusividade em `PranchetaStudio`.

### 6. Pipeline de Eventos e Sincronização em Tempo Real (Prancheta)
- **Fluxo Unidirecional com Notificação Contínua**: O `TacticalBoard` expõe a prop `onChange`, invocada a cada alteração no histórico (`saveStateToHistory` e `restoreSnapshot`). O contentor pai (`PranchetaStudio`) mantém a cópia imutável e atualizada de `dadosTaticos`, garantindo persistência imediata na base de dados ao acionar o botão de gravação.
- **Predefinição de Escala de Atletas**: Adoção do tamanho `sm` (11px de raio) como padrão no motor geométrico, otimizando o rácio espacial do relvado tático.

### 7. Roteamento Contextual de Edição (Treinos -> Prancheta)
- **Interoperabilidade sem Duplicação**: O clique no cartão do exercício em `/treinos` navega diretamente para `/prancheta?id={exercicioId}`. O `PranchetaStudio` resolve o parâmetro da rota de forma assíncrona com `<Suspense>`, hidratando a prancheta oficial e fornecendo os fluxos de gravação direta (atualização no catálogo) ou clonagem (duplicação).

### 13. Reordenação Atómica de Sessões de Treino e Drag & Drop
- **Padrão de Batch Reordering Atómico**:
  - A ordenação de coleções ordenadas (`@OrderBy("ordem ASC")`) nunca deve ser feita através de múltiplos pedidos `PUT` individuais concorrentes, sob pena de sofrer de *Lost Updates* decorrentes do isolamento de transações em bases de dados relacionais.
  - Criou-se o endpoint atómico `PUT /api/treinos/{sessaoId}/exercicios/reordenar` associado ao método `@Transactional public SessaoTreino reordenarExercicios(UUID sessaoId, List<UUID> exercicioAssocIds)`.
- **Estratégia de Sincronização Otimista no Cliente**:
  - O hook `useTreinoDetailStudio` implementa atualização otimista imediata na memória do cliente (`onTreinoUpdated({ ...treino, exercicios: novaLista })`).
  - O resultado da chamada atómica do backend substitui o estado local de forma idempotente, eliminando o padrão de *bouncing* (onde os cartões regressavam à posição anterior).
### 15. Arquitetura de Edição Contextual Desacoplada (`TacticalEditSidebar`)
- **Padrão de Desenho: Properties Inspector Desacoplado vs. Floating Overlays**:
  - A abordagem inicial de desenhar modais/toolbars flutuantes com posicionamento absoluto no interior do canvas sofria de limitações geométricas estruturais: nós com coordenadas no topo do relvado projetavam a barra flutuante para fora da *bounding box* do elemento pai (`overflow: hidden`), resultando em cortes de interface e obstrução visual dos elementos envolventes.
  - A arquitetura migrou para um **Properties Inspector Desacoplado** (`TacticalEditSidebar.tsx`), montado condicionalmente na lateral esquerda do `TacticalBoard`.
- **Vantagens de Engenharia & UX**:
  - **Isolamento de Layout**: O canvas 2D permanece 100% livre de sobreposições DOM, facilitando o arrastamento (*drag & drop*), a rotação e a visibilidade dos restantes atletas e trajetórias.
  - **Ergonomia e Acessibilidade**: Acesso a controlos complexos (paletas de cores com seletores hexadecimais nativos, sliders contínuos de opacidade, botões de rotação direcional e inputs tipados para camisolas/siglas) numa coluna estruturada e rolável.
  - **Feedback Bidirecional**: O elemento selecionado no relvado recebe um halo luminoso (*neon aura*) desenhado nativamente via Canvas API, enquanto a barra lateral esquerda reflete e altera o seu estado em tempo real com histórico automático (`HistorySnapshot`).
- **Padrão de Interação: Drag vs. Click Threshold (4px)**:
  - Eliminação do falso positivo de seleção através de rastreamento vetorial `pointerInteractionRef`. 
  - Ações com deslocamento $\Delta > 4\text{px}$ são classificadas estritamente como *Drag Operations* (translação pura do nó sem abrir a barra de propriedades).
  - Apenas ações estáticas ($\Delta \le 4\text{px}$) no evento `pointerUp` acionam o *Select & Inspect Mode*, preservando o relvado desimpedido durante a rápida montagem posicional de exercícios.

### 16. Arquitetura da Periodização da Época (`Periodo` & Ciclos)
- **Modelação de Dados da Periodização Desportiva**:
  - A estruturação do treino no futebol baseia-se na hierarquia canónica:
    - **Macroestrutura**: `Periodo` (`PREPARATORIO`, `COMPETITIVO`, `TRANSICAO`).
    - **Mesoestrutura**: `Mesociclo` (Blocos de 3 a 6 semanas com objetivos específicos).
    - **Microestrutura**: `Microciclo` (Semana padrão de treino e competição).
    - **Unidade de Treino**: `UnidadeTreino` / UT (Sessão diária singular).
- **Consistência de API e Contratos REST**:
  - A entidade `SessaoTreino` armazena a propriedade `periodo` como coluna persistida, com fallback seguro para `"COMPETITIVO"` nos mappers DTO para manter compatibilidade com sessões legadas.
  - A interface de utilizador consome os metadados de forma reativa, integrando o seletor contextual no formulário de estúdio e refletindo-o instantaneamente nos componentes de visualização (`TreinoStudioHeader`, `TreinoPrintPreviewModal`).

### 17. Arquitetura de Impressão e Exportação PDF de Alta Fidelidade
- **Padrão de Desenho: React Portal com Desacoplamento do DOM**:
  - Para garantir que a folha de impressão em PDF nunca seja contaminada por elementos da aplicação (sidebars, toolbars, cabeçalhos ou menus), o componente `TreinoPrintPreviewModal` utiliza `createPortal` para se anexar diretamente ao `document.body` sob o identificador `#dossier-print-portal`.
- **Camada de Isolamento CSS `@media print`**:
  - A folha de estilo global (`globals.css`) aplica uma regra de exclusão total: `body > *:not(#dossier-print-portal) { display: none !important; }`.
  - Isto garante que apenas o nó da folha A4 oficial seja processado pelo motor de impressão do browser, assegurando dimensões exatas de A4 portrait (`210mm` de largura com margem padrão de `8mm`) e prevenindo quebras indevidas de cartões táticos através de `.print-avoid-break { break-inside: avoid !important; }`.

### 18. Arquitetura Multiequipa, Gestão do Clube e Agregação Dinâmica de Dados
- **Isolamento Estrito por Equipa Ativa (`activeTeam`)**:
  - Cada domínio de negócio (`Atletas`, `Treinos`, `Calendário`, `Assiduidade`, `Estatísticas`) opera sob um esquema de particionamento lógico amarrado à chave estrangeira `equipa_id`.
  - A alternância de equipa no estado global (`TopHeader`, `ClubePage`) desencadeia a re-execução de consultas isoladas, garantindo que nenhum dado de uma equipa (ex: Seniores) transborde para outra (ex: Sub-17).
### 21. Sprint 3: Decomposição Modular do TacticalBoard e Separação de Preocupações (SoC)
- **Princípio da Responsabilidade Única (Single Responsibility Principle)**:
  - Decomposição do monolito `TacticalBoard.tsx` (1610 linhas) num componente orquestrador (< 450 linhas) com delegação total para módulos especializados.
- **Camada de Geometria e Transformações Afins (`tacticalGeometry.ts`)**:
  - Encapsulamento das funções matemáticas de projeção vetorial e rotação afim, com 100% de isolamento em relação ao DOM ou Canvas.
- **Máquinas de Estados de Interação Especializadas (Hooks de UI)**:
  - `useBoardInteraction.ts`: Orquestração de drag-and-drop, redimensionamento, rotação e seleção de elementos com gestão otimizada de pointer capture.
  - `useBoardKeyboard.ts`: Desacoplamento da escuta de eventos do teclado e clipboard da aplicação.
- **Renderizadores Gráficos Desacoplados (`canvasDrawers.ts`)**:
  - Isolamento dos procedimentos de pintura em Canvas 2D, permitindo otimizações e reutilização futura em previews estáticos e exportações de relatórios.

### 22. Sprint 4: Arquitetura de Agregação de Indicadores no Dashboard
- **Padrão de Agregação Concorrente e Resiliente (`useDashboardData`)**:
  - Encapsulamento do pipeline de dados assíncronos (`Atletas`, `EventosCalendario`, `RegistosAssiduidade`) num único hook especializado.
  - Utilização de `Promise.allSettled` para garantir que falhas parciais de rede não impedem a visualização dos restantes cartões e métricas.
  - Eliminação de dados mock estáticos (`constants.ts`), consolidando a base de dados como fonte única de verdade (*Single Source of Truth*).

### 23. Sprint 5: Desacoplamento e Decomposição do PranchetaStudio
- **Separação de Preocupações (Separation of Concerns)**:
  - O componente `PranchetaStudio.tsx` (1360 linhas) foi reduzido para um orquestrador enxuto com delegação completa.
- **Hooks Especializados de Domínio**:
  - `usePranchetaPastas.ts`: Encapsula a árvore de navegação, persistência em `localStorage` e modos de visualização.
  - `usePranchetaGestao.ts`: Gerencia o ciclo de vida assíncrono dos exercícios e a integração com planos de treino.
- **Componentes Visuais Modulares**:
  - `PranchetaSidebarPastas.tsx`, `PranchetaMetadataBar.tsx` e `PranchetaHeader.tsx`.

### 24. Sprint 6: Arquitetura de Edição Contextual e Sub-secções Modulares
- **Padrão de Decomposição Vertical por Tipo de Elemento**:
  - Em vez de um bloco condicional monolítico no mesmo ficheiro, cada entidade gráfica tática possui o seu componente de edição isolado (`PlayerEditSection`, `GoalEditSection`, `LineEditSection`, `ShapeEditSection`, `EquipmentEditSection`).
- **Reutilização de Constantes Visuais**:
  - Extração de `constants.ts` com paletas de cores táticas e presets de espessura/opacidade partilhados entre o canvas e as ferramentas laterais.

### 25. Sprint 7: Arquitetura Modular do Catálogo de Exercícios no Módulo de Treinos
- **Encapsulamento Feature-Based**:
  - Organização dos sub-componentes de catálogo na pasta `frontend/modules/treinos/modals/catalogo/`.
  - Reutilização dos utilitários centrais de hierarquia de pastas (`models/pasta.ts`) e constantes unificadas de categorias (`models/categoria-exercicio.ts`).
- **Desacoplamento Visual e Performance**:
  - `TacticalBoardThumbnail` isolado para renderização de miniaturas leves no catálogo sem instanciar a engine completa do canvas 2D interativo.

### 26. Hardening de Segurança: Arquitetura de Autorização de Objetos e Validação
- **Defesa contra IDOR/BOLA via `EquipaSecurityService`**:
  - Camada de serviço de segurança injetada no ecossistema Spring Security, assegurando validação de posse sobre entidades associadas a equipas.
- **Validação Estrita de DTOs**:
  - Aplicação de Bean Validation em todos os fluxos de autenticação e registo, impedindo payloads malformados ou incompletos.
- **Tratamento Uniforme de Erros de Segurança (403 Forbidden)**:
  - Centralização no `GlobalExceptionHandler` de exceções de autorização, padronizando a resposta `ErrorResponse` em conformidade com as diretrizes da API REST.
- **Injeção Dinâmica de Segredos**:
  - Suporte a variáveis de ambiente para segredos criptográficos (JWT) e flags de cookies seguros em produção.

### 27. Estabilidade de Renderização e Prevenção de Dependency Loops em Hooks Customizados
- **Padrão de Callback Ref (`useRef`)**:
  - Funções de retorno (*callbacks*) opcionais injetadas por componentes pais em hooks especializados (`usePranchetaGestao`) são sincronizadas via `useRef`.
  - Isto previne a invalidação em cadeia de dependências de `useCallback` e `useEffect`, eliminando re-buscas assíncronas concorrentes e cintilações (*flickering*) na interface do utilizador.
- **Memoização Derivada com `useMemo`**:
  - Filtros de coleções em tempo real mantidos com `useMemo` para evitar recalcular filtros de texto durante eventos de layout e transições de drawer.

### 28. Prancheta Dinâmica: Arquitetura de Árvore de Jogadas e Animação Temporal
- **Desacoplamento de Estado com Funções Puras (`models/tacticplay.ts`)**:
  - Toda a lógica de inserção de nós (`addFrameToTree`, `addAlternativeToTree`), remoção e navegação na timeline opera sobre estruturas de dados imutáveis.
- **Interpolação de Movimento Paramétrica**:
  - Separação entre a estrutura de frames discretos e a renderização contínua através de funções matemáticas de interpolação linear, permitindo taxas de atualização dinâmicas (30 a 60 FPS) sem distorções de coordenadas.

### 29. Hook Reativo `useTacticalPlay`: Gestão de Linha do Tempo e Propagação de Movimento
- **Atualizações de Estado Funcionais Atómicas**:
  - Adoção sistemática de `setTree((prev) => ...)` para eliminar atrasos de encerramento (*closure lag*) e inconsistências de renderização em chamadas sequenciais de frames.
- **Árvore de Propagação Dinâmica ($\Delta x, \Delta y$)**:
  - Algoritmo de travessia em profundidade (DFS) que atualiza as coordenadas dos elementos em ramificações derivadas de forma consistente com a intenção do utilizador.
- **Histórico Linear Imutável com Ponto de Ramificação**:
  - O histórico de Undo/Redo armazena referências imutáveis da árvore inteira, assegurando que o retrocesso a um ponto anterior e a subsequente criação de uma nova ramificação poda os estados obsoletos sem efeitos secundários.

### 30. Motor de Renderização Canvas 2D e Gravação com MediaRecorder
- **Sincronização de Estado via `useRef` no `requestAnimationFrame`**:
  - Para evitar re-iniciar o loop de renderização do canvas desnecessariamente, o componente `DynamicTacticalCanvas` espelha as referências mutáveis (`treeRef`, `currentFrameRef`, `pitchStyleRef`) diretamente no loop gráfico.
- **Isolamento do Módulo de Gravação (`useTacticalExport.ts`)**:
  - Desacoplamento da lógica de gravação em stream do Canvas via `captureStream(30)` e `MediaRecorder`, permitindo exportações determinísticas com fallbacks de formatos WebM/MP4 e barra de progresso unificada.

### 31. Arquitetura Modular do Estúdio Dinâmico (Orquestração e Decisão)
- **Desacoplamento Visual Feature-Based**:
  - Organização de componentes especializados na pasta `components/prancheta-dinamica/` (`DynamicToolbar`, `DynamicTimeline`, `DynamicBranchModal`, `DynamicExportOverlay`), comunicando através de interfaces estritas e callbacks puros.
- **Padrão de Diálogo de Decisão Tática (`DynamicBranchModal`)**:
  - Tratamento de bifurcações como eventos desacoplados: o canvas emite `onDecisionPoint(node)` sem conhecer a implementação visual da interface, delegando ao orquestrador `PranchetaDinamicaStudio` a apresentação do modal e a atualização da rota ativa.





























