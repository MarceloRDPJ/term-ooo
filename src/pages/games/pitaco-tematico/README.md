# PITACO Tematico

PITACO solo, mas com escolha de **tema** antes de comecar. Inspirado
no [Loldle](https://loldle.net/), que tambem oferece variantes por
categoria reaproveitando a mesma engine.

## Como funciona

1. Tela inicial mostra 6 cards de tema: classico, frutas, objetos,
   filmes, series, animes.
2. Ao escolher um tema, o jogador cai no tabuleiro normal do PITACO
   (1 board, 6 tentativas) mas a palavra do dia vem do dicionario do
   tema escolhido.
3. Cada tema tem ~30-50 palavras de 5 letras (normalizadas, sem
   acento). O conjunto vive em `themes.ts`.
4. Botao **trocar tema** no header volta para a tela de selecao
   (reinicia o jogo).
5. A persistencia fica em `localStorage`:
   - `pitaco:tematico:theme` - tema selecionado por ultimo
   - `pitaco:tematico:state:${theme}:${dateKey}` - state do dia por tema
   - `pitaco:tematico:stats` - stats agregadas (streak, distribuicao)

## Engine

Reaproveitamos 100% o engine existente
(`processGuess`, `evaluateGuess`) e os componentes visuais
(`GameLayout`, `Keyboard`, `Header`, dialogs). A unica coisa que
muda e a fonte de palavras - construimos o `GameState` inicial
manualmente com a solucao do tema, em vez de delegar para
`createInitialGameState` que sempre le do `MODE_CONFIG`.

A validacao dupla (engine + tema) garante que:

- O chute passa pelo dicionario geral do Term.ooo (via engine).
- O chute tambem precisa estar na lista do tema (validacao
  adicional em `isValidThemeWord`), evitando misturar palavras
  de outros temas.

## Estrutura

- `themes.ts` - dicionarios por tema + `getDailyWord` + `isValidThemeWord`
- `PitacoTematicoGame.tsx` - componente principal
  - `ThemeSelector` - tela inicial com grid de cards
  - `ThemeCard` - card individual clicavel
  - `PitacoTematicoGame` - tabuleiro com engine integrado

## Adicionando um tema novo

1. Adicionar o `ThemeId` em `src/lib/multiplayer-types.ts` (feito pelo
   time de tipos).
2. Adicionar o array de palavras em `themes.ts` (so palavras de 5
   letras que existem em `termoAllowed` ou em `accentMap`).
3. Adicionar a entrada em `THEMES` e `THEME_LIST`.
4. (Opcional) Atualizar `RoomsHome.tsx` para o tema aparecer tambem
   em pautas multiplayer.
