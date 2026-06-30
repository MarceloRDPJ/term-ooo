# PITACO Emoji

Jogo de adivinhacao inspirado em [Loldle Emoji](https://loldle.net/).
O jogador recebe uma combinacao de 3-5 emojis (hobby, funcao, personalidade)
e tem 6 tentativas para adivinhar qual auditor do escritorio PITACO ela
representa. O chute e pelo nome ou apelido, com autocomplete.

## Estrutura

```
src/pages/games/pitaco-emoji/
├── PitacoEmojiGame.tsx  # Tela principal (autocomplete + emojis + tentativas)
├── engine.ts            # createInitialEmojiState, processEmojiGuess, pickEmojiTargetForDay
├── types.ts             # EmojiAuditor, EmojiGuess, EmojiState
├── data.ts              # 32 auditores ficticios (3-5 emojis cada)
├── storage.ts           # Persistencia localStorage (pitaco:emoji:state:${dateKey})
└── README.md            # Este arquivo
```

## Fluxo do jogo

1. **Auditor-alvo do dia**: selecionado deterministicamente pelo `dayNumber`
   com `(dayNumber % 32)`. Todos os jogadores do escritorio recebem o mesmo
   auditor no mesmo dia.
2. **Display inicial**: 3-5 emojis grandes (animados, com spring) + contador
   de tentativas restantes.
3. **Chute**: input com autocomplete (filtra por nome ou apelido, ignora
   auditores ja chutados). Botao de enviar e ENTER para confirmar.
4. **Feedback por chute**:
   - **verde (Homologado)** = acertou o auditor
   - **cinza (Errado)** = auditor diferente do alvo
5. **Vitoria**: acertar o auditor-alvo. Persiste o resultado no
   localStorage na chave `pitaco:emoji:state:${dateKey}`.
6. **Derrota**: 6 tentativas esgotadas. Revela o auditor-alvo e a dica
   textual do `emojiHint`.

## API publica

### `engine.ts`

```ts
pickEmojiTargetForDay(dayNumber): EmojiAuditor
createInitialEmojiState(dateKey, dayNumber): EmojiState
processEmojiGuess(state, rawGuess): EmojiProcessResult
isEmojiWon(state): boolean
```

### `data.ts`

```ts
EMOJI_AUDITORES              // 32 auditores (id, name, nickname, role, emojis, emojiHint)
findAuditorById(id): EmojiAuditor | undefined
findAuditorByQuery(q): EmojiAuditor | undefined
```

### `storage.ts`

```ts
emojiStorageKey(dateKey): string
loadEmojiState(dateKey): EmojiState | null
saveEmojiState(dateKey, state): void
clearEmojiState(dateKey): void
```

## Pendencias (proximas iteracoes)

- [ ] Adicionar "dica extra" apos 3 tentativas erradas.
- [ ] Adicionar modo "archive" (jogar dias anteriores).
- [ ] Compartilhamento estilo PITACO principal.
- [ ] Stats globais (vitorias, sequencia, distribuicao de tentativas).
- [ ] Mais auditores no banco (alvos diarios por mais tempo sem repetir).
