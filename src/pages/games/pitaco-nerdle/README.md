# PITACO Nerdle

Adivinhe a equacao matematica de 8 caracteres em 6 tentativas. Inspirado no
[Nerdle](https://en.wikipedia.org/wiki/Nerdle).

## Como jogar

- A equacao do dia tem **8 caracteres** no formato `AA<op>BB=CC` (ex: `12+34=46`).
- O alfabeto e `0-9 + - * / =`. Sem letras.
- Cada palpite deve ser uma equacao aritmetica valida (KISS: apenas um operador,
  sem parenteses).
- Feedback por caractere:
  - **Ciano** (`#00B2A9`): caractere correto na posicao correta.
  - **Roxo** (`#A78BFA`): caractere esta na equacao, mas em outra posicao.
  - **Cinza** (`#243447`): caractere nao aparece na equacao.
- 6 tentativas. A cada dia uma nova equacao (deterministica via hash da data).

## Arquivos

- `types.ts` - tipos e constantes (`NERDLE_LENGTH`, `NERDLE_MAX_ATTEMPTS`, etc.).
- `equations.ts` - pool de 30 equacoes validas (apenas `+` e `-` no pool).
- `engine.ts` - logica pura: `createInitialNerdleState`, `processNerdleGuess`,
  `isNerdleWon`, `isValidEquation`, `isValidChars`, `evaluateNerdleGuess`.
- `PitacoNerdleGame.tsx` - componente React (board, teclado, dialog, persistencia).

## Persistencia

- Chave localStorage: `pitaco:nerdle:state:${dateKey}` (dateKey = `YYYY-MM-DD`).
- Estado do dia e carregado na entrada; limpo/resetado com o botao "reabrir".

## API do engine

```ts
import {
  createInitialNerdleState,
  processNerdleGuess,
  isNerdleWon,
  isValidEquation,
  isValidChars,
  pickNerdleSolution,
  evaluateNerdleGuess,
  updateNerdleKeyStates,
} from './engine'
import { NERDLE_EQUATIONS } from './equations'

const dateKey = '2026-06-30'
const state = createInitialNerdleState(dateKey, NERDLE_EQUATIONS)
const { newState, error } = processNerdleGuess(state, '12+34=46')
if (isNerdleWon(newState)) {
  // venceu!
}
```
