# Plano de Expansão: Dossier do Treinador (Elite Edition)

Este documento regista o plano estratégico e técnico para a evolução da plataforma **Dossier do Treinador**, incorporando os quatro módulos selecionados pelo treinador especialista: **Match Day (1)**, **Avaliação Individual de Desempenho (2)**, **Scouting de Adversários (4)** e a **Biblioteca Avançada de Exercícios (5)**.

---

## 1. Módulo de Match Day (Convocatórias & Onze Inicial)

### Objetivo
Gerir a operação e a estratégia para o dia de jogo, permitindo selecionar convocados, definir o onze inicial e estruturar o posicionamento tático inicial.

### Arquitetura Técnica
- **Backend (Spring Boot):**
  - Criar entidade `@Entity` `Convocatoria` (Relação `@ManyToOne` com `EventoCalendario` e `Atleta`, campo `estado`: `CONVOCADO`, `TITULAR`, `SUPLENTE`, `NAO_CONVOCADO`).
  - Criar entidade `@Entity` `AlinhamentoTatico` (Sistema tático ex: "4-3-3", posições X/Y dos jogadores no campo para o pontapé de saída, associado ao jogo).
  - Endpoints REST: `/api/eventos/{eventoId}/convocatoria` e `/api/eventos/{eventoId}/alinhamento`.
- **Frontend (Next.js):**
  - Aba "Match Day" no detalhe do Jogo no Calendário.
  - Interface baseada no motor do `TacticalBoard` para posicionar o onze inicial no relvado.
  - Listagem interativa para selecionar a convocatória oficial.

---

## 2. Módulo de Análise de Desempenho Individual (Player Ratings & Feedback)

### Objetivo
Quantificar e registar o rendimento qualitativo e quantitativo de cada atleta pós-treino ou pós-jogo.

### Arquitetura Técnica
- **Backend (Spring Boot):**
  - Criar entidade `@Entity` `AvaliacaoDesempenho` (Associa `Atleta` com `EventoCalendario` ou `SessaoTreino`).
  - Campos: `notaAtleta` (1 a 10), `intensidade` (1 a 5), `comentariosTecnico` (String).
  - Endpoints REST: `/api/avaliacoes` e `/api/atletas/{atletaId}/evolucao`.
- **Frontend (Next.js):**
  - Grelha de avaliação integrada no fluxo de pós-treino / assiduidade.
  - Gráfico de evolução de desempenho no cartão individual do atleta (`PlayerCard`).

---

## 3. Módulo de Scouting & Observação de Adversários

### Objetivo
Centralizar a preparação e análise tática do próximo oponente.

### Arquitetura Técnica
- **Backend (Spring Boot):**
  - Criar entidade `@Entity` `Adversario` (Nome, brasão/foto, sistema preferido, pontos fortes, pontos fracos, notas de análise).
  - Associação do `Adversario` ao `EventoCalendario` do tipo `JOGO`.
  - Endpoints REST: `/api/adversarios`.
- **Frontend (Next.js):**
  - Nova página na barra lateral: **"Scouting / Adversários"**.
  - Ficha interativa de análise do adversário com blocos visuais para pontos fortes/fracos e registo de observações em vídeo/texto.

---

## 4. Biblioteca de Exercícios com Métricas e Tags Avançadas (Training Library Pro)

### Objetivo
Enriquecer o catálogo global de exercícios com taxonomia da Periodização Tática e estimativas de carga.

### Arquitetura Técnica
- **Backend (Spring Boot):**
  - Expandir a entidade `@Entity` `Exercicio` com novos campos:
    - `principiodPeriodizacao` (Geral, Dirigido, Especial, Específico).
    - `regime` (Recuperação, Tensão, Duração, Velocidade).
    - `cargaExternaEstimada` (Metros percorridos, intensidade).
  - Atualizar DTOs e Mappers.
- **Frontend (Next.js):**
  - Atualizar modal de criação/edição de exercícios e o catálogo (`CatalogoExerciciosModal`).
  - Filtros avançados na biblioteca de exercícios por Princípio e Regime tático.
