# Narutodle

Jogo tematico do PITACO: adivinhe um personagem de **Naruto Shippuden** a partir
de 7 atributos categoricos em ate **8 tentativas**. Inspirado em
[narutodle.net](https://narutodle.net/) (modo classico).

## Como funciona

- O sistema escolhe um **personagem-alvo do dia** de forma deterministica
  (mesmo ninja para todos os jogadores no mesmo dia).
- O jogador digita o nome do personagem em um input com **autocomplete**.
- A cada chute, o sistema compara **7 atributos** e mostra feedback colorido:
  - **cla** (Uzumaki, Uchiha, Hyuga, ...)
  - **vila** (Konoha, Suna, Kiri, Kumo, Iwa, Otogakure, Akatsuki)
  - **rank** (Genin, Chunin, Jonin, ANBU, Kage, Sannin)
  - **kekkei genkai** (Sharingan, Byakugan, Rinnegan, Wood Release, ...)
  - **elemento** (Fogo, Vento, Trovão, Terra, Agua, Yin, Yang, Yin-Yang)
  - **afiliacao** (Konoha, Akatsuki, Sannin, Kara, Outros)
  - **genero** (M, F, Outro)
- Cores do feedback:
  - **verde** = atributo correto
  - **amarelo** = perto (apenas no `rank`, diferenca de 1 nivel)
  - **vermelho** = errado
- Vitoria = adivinhar o personagem. Derrota = 8 tentativas sem acerto.

## Estrutura

```
src/pages/games/narutodle/
├── NarutodleGame.tsx   # UI principal (autocomplete, board 8x7, game over)
├── engine.ts           # pickTargetForDay, processNarutodleGuess, computeFeedback
├── storage.ts          # localStorage `narutodle:state:${dateKey}`
├── types.ts            # NarutodleState, NarutodleFeedback, NarutodleCharacter, ...
├── characters.ts       # 43 personagens de Naruto Shippuden
└── README.md           # este arquivo
```

## Persistencia

Chave no localStorage: `narutodle:state:${dateKey}` (YYYY-MM-DD).
Auto-save em todo `setState`. O save guarda o `targetId`, a lista de
chutes (`guesses[]`) e o `history[]` (ids chutados para evitar repeticao).

## Determinismo

`pickTargetForDay(dayNumber, characters)` faz
`((dayNumber % len) + len) % len`. Com 43 personagens, o ciclo se
repete a cada 43 dias, mas o personagem do dia e sempre o mesmo
para todos os jogadores do escritorio (padrao Worldle / Term.ooo).
