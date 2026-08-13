
### Motor de Renderização (Draw Loop)
- **Integração do equestAnimationFrame**: A função drawLoop será movida para dentro do componente React, iniciada num useEffect na montagem.
- **Tradução das Funções Auxiliares**: As funções drawField, drawArrowhead e drawTacticalDrawings (provenientes de drawing.js) serão transformadas em métodos internos do componente. Estas funções vão deixar de aceder ao window.state e passarão a extrair os dados lendo sempre a fotografia mais atual a partir do stateRef.current.
- **Memory Management**: O useEffect do drawLoop irá devolver uma função de limpeza (cleanup) chamando cancelAnimationFrame utilizando a *frame ID* guardada numa ef, evitando colisões caso o componente desmonte.
- **Relvado Imediato**: Logo que o canvas inicie, será pintado o #1b4332 (Verde Base) e as marcações normais.
