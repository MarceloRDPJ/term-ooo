# PITACO Citacao

Jogo de adivinhacao inspirado em [Loldle Quote](https://loldle.net/quote).
O jogador recebe uma citacao do chat do escritorio e tem 6 tentativas
para adivinhar qual auditor a mandou. Tom: corporativo + humor de
escritorio (pauta, homologar, cracha, pitaco, etc).

## Estrutura

```
src/pages/games/pitaco-citacao/
├── PitacoCitacaoGame.tsx  # Tela principal (citacao grande + autocomplete + tentativas)
├── engine.ts              # createInitialCitacaoState, processCitacaoGuess
├── types.ts               # Citacao, QuoteGuess, CitacaoState
├── data.ts                # 42 citacoes ficticias + reuso do cadastro de auditores do PITACO Emoji
├── storage.ts             # Persistencia localStorage (pitaco:citacao:state:${dateKey})
└── README.md              # Este arquivo
```

## Fluxo do jogo

1. **Citacao-alvo do dia**: selecionada deterministicamente pelo `dayNumber`
   com `(dayNumber % 42)`. Todos os jogadores recebem a mesma citacao no
   mesmo dia.
2. **Display inicial**: citacao grande em italico, com icone de speaker
   (MessageSquareQuote) e badge de "contexto" (ex: "reuniao de status").
3. **Chute**: input com autocomplete (filtra pelo mesmo cadastro de
   auditores do PITACO Emoji, garantindo consistencia entre os 2 jogos).
4. **Feedback por chute**:
   - **amarelo (Quem falou)** = acertou o autor
   - **cinza (Errado)** = autor diferente do alvo
5. **Vitoria**: acertar o autor-alvo. Persiste o resultado no
   localStorage na chave `pitaco:citacao:state:${dateKey}`.
6. **Derrota**: 6 tentativas esgotadas. Revela a citacao completa com
   o card do autor (emoji + nome + role).

## API publica

### `engine.ts`

```ts
createInitialCitacaoState(dateKey, dayNumber): CitacaoState
processCitacaoGuess(state, rawGuess): CitacaoProcessResult
isCitacaoWon(state): boolean
```

### `data.ts`

```ts
CITACOES                    // 42 citacoes (id, authorId, text, context)
findCitacaoById(id): Citacao | undefined
pickCitacaoForDay(dayNumber): Citacao
citacaoAuthorName(citacao): string
```

Reexporta `EMOJI_AUDITORES` e `findAuditorById` de `../pitaco-emoji/data`.

### `storage.ts`

```ts
citacaoStorageKey(dateKey): string
loadCitacaoState(dateKey): CitacaoState | null
saveCitacaoState(dateKey, state): void
clearCitacaoState(dateKey): void
```

## Pendencias (proximas iteracoes)

- [ ] Adicionar filtro por "auditor que fala muito no chat" como pista
      alternativa (mostra genero/equipe ao inves do autor).
- [ ] Citacoes "longas" (3-4 linhas) para aumentar a dificuldade.
- [ ] Adicionar modo "archive" (jogar dias anteriores).
- [ ] Compartilhamento estilo PITACO principal.
- [ ] Stats globais (vitorias, sequencia, distribuicao de tentativas).
