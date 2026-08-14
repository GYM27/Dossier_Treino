# Coach Dossier - Elite Analyst Edition - PRD

Este documento detalha o sistema de design extraído diretamente do projeto no Stitch, com foco na paleta de cores e tipografia a ser utilizada na aplicação "Dossier do Treinador".

## Paleta de Cores (Modern Glassmorphism)

O esquema de cores foi desenhado para maximizar o contraste e reduzir o cansaço visual, evocando a precisão de um "Centro de Comando" desportivo de alta tecnologia.

- **Primary (Sky Blue):** `#38bdf8`
  - *Uso:* Destacar estados de ação crítica, navegação ativa, dados importantes e "Glow" elements.
- **Secondary (Dark Blue):** `#1e293b`
  - *Uso:* A cor de superfície base. Deve ser aplicada com 80% de opacidade para criar o efeito de "vidro" (Glassmorphism).
- **Tertiary (Rose/Red):** `#f43f5e`
  - *Uso:* Reservada apenas para alertas críticos, emergências ou avisos do sistema (ex: lesões de jogadores).
- **Neutral (Slate):** `#0f172a`
  - *Uso:* O fundo (Background) profundo da aplicação que confere a sensação de profundidade de ecrã tático.

## Tipografia

O sistema utiliza uma estratégia "Dual-Font", equilibrando limpeza visual (Sans-Serif) com precisão técnica (Monospace).

### Famílias de Tipos
1. **Inter:** Fonte base, limpa e legível. Usada para cabeçalhos, botões, e texto principal (UI Chrome).
2. **JetBrains Mono:** Fonte de "dados". Usada para métricas numéricas, contadores (idade, minutos) e telemetria (para criar uma sensação de relatório analítico "codificado").

### Escala Tipográfica (Design Tokens)

- **Display Large**
  - **Uso:** Títulos principais do Dashboard.
  - **Fonte:** Inter
  - **Tamanho:** 48px
  - **Peso:** 700 (Bold)
  - **Espaçamento:** -0.02em
  - **Altura de Linha:** 56px

- **Headline Medium**
  - **Uso:** Títulos de secções/janelas.
  - **Fonte:** Inter
  - **Tamanho:** 24px
  - **Peso:** 600 (Semi-bold)
  - **Espaçamento:** 0.05em
  - **Altura de Linha:** 32px

- **Metric Large**
  - **Uso:** Dados vitais em grande destaque (ex: Estatísticas de Equipa).
  - **Fonte:** JetBrains Mono
  - **Tamanho:** 36px
  - **Peso:** 500 (Medium)
  - **Altura de Linha:** 40px

- **Metric Small**
  - **Uso:** Valores precisos em tabelas ou mini-estatísticas.
  - **Fonte:** JetBrains Mono
  - **Tamanho:** 14px
  - **Peso:** 400 (Regular)
  - **Altura de Linha:** 20px

- **Body Base**
  - **Uso:** Texto geral e descrições.
  - **Fonte:** Inter
  - **Tamanho:** 16px
  - **Peso:** 400 (Regular)
  - **Altura de Linha:** 24px

- **Label Caps**
  - **Uso:** Rótulos pequenos, legendas de gráficos (tudo em maiúsculas).
  - **Fonte:** Inter
  - **Tamanho:** 12px
  - **Peso:** 700 (Bold)
  - **Espaçamento:** 0.1em
  - **Altura de Linha:** 16px
