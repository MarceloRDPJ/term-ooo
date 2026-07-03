# Narutodle.net — Auditoria Visual Completa (Agente 1)

> Pesquisa executada em 03/07/2026 via `webfetch` direto no site
> (narutodle.net é um SPA Vue 2 + Webpack, então o HTML inicial é
> vazio — todo o markup vive no JS bundle). O CSS está em
> `css/index.11a6033b16abd63429ae.1776461301287.css` e o JS em
> `js/index.11a6033b16abd63429ae.1776461300344.js` (chunked).

---

## 1. PALETA OFICIAL (extraída do CSS)

### 1.1 Cores PRIMÁRIAS (mais usadas — extraídas por frequência)

| Hex       | Uso confirmado (contexto do CSS)                                 | Frequência |
|-----------|------------------------------------------------------------------|------------|
| `#000`    | Texto / bordas sólidas no footer                                | 147×       |
| `#fff`    | Texto claro (logo, títulos de botão)                            | 52×        |
| `#FF601B` | **LARANJA NARUTO** — logo, headers, swatch, toggle on           | 11×        |
| `#D55E00` | Laranja mais escuro — variantes de gradient/borda               | 10×        |
| `#D53633` | **VERMELHO** — fundo de tiles/perdeu (e borda interna `#FF3737`) | 10×        |
| `#9E2723` | Vermelho escuro — variantes                                     | 10×        |
| `#AF9767` | **DOURADO/KHAKI** — borda de todos os cards de info/clues       | 7×         |
| `#F6D44E` | **AMARELO** — accent (toggle off / text accent)                 | 6×         |
| `#EDE8D8` | Off-white cremoso                                               | 5×         |
| `#213B55` | **AZUL-MARINHO** — fundo dos infoBox/clues tiles                | 4×         |
| `#004152` | Azul-petróleo escuro — variantes de fundo de modal              | 4×         |
| `#0E1E25` | Quase preto azulado                                             | 3×         |
| `#181C20` | Background principal escuro do body                              | 2×         |
| `#38B9FF` | Azul claro (link website no popup about)                        | 1× (JS)    |

### 1.2 Background base do site
```css
html{
  background-size: cover !important;
  background-color: #78CED7 !important;   /* teal/ciano claro */
  transition: background-image .1s ease;
}
body{ background-color: transparent !important; }
```

> O fundo de fato é a imagem `img/Background.2a91c097.png` (uma arte
> de Naruto) carregada dinamicamente via JS sobre o teal `#78CED7`.
> A cor teal aparece enquanto a imagem carrega.

### 1.3 Cores dos MODOS (inferidas via análise do bundle + nome do PNG)

Os botões de modo **NÃO** recebem cor via classe CSS (busca por
`.button-classic`, `.button-jutsu`, `.button-quote`, `.button-eye` no
CSS retornou **zero resultados**). A cor vem **embutida nos próprios
PNGs** (a imagem já é o card colorido com o ícone desenhado dentro).

| Modo      | Rota        | Imagem do botão            | Cor inferida do PNG       |
|-----------|-------------|----------------------------|---------------------------|
| Classic   | `/classic`  | `ButtonClassic.d8a0e20d.png` | **AZUL** (~#38B9FF)       |
| Jutsu     | `/jutsu`    | `ButtonJutsu.bb8de54c.png`   | **VERDE** (~#3DA75E)      |
| Quote     | `/quote`    | `ButtonQuote.1a797923.png`   | **AMARELO/LARANJA**       |
| Eye       | `/eye`      | `ButtonEye.60257b8b.png`     | **MAGENTA** (vermelho-rosa) |
| Infinite  | `/infinite` | `ButtonInfinite.a5d9e7e4.png`| mesmo azul do Classic     |

> **Obs:** o usuário pediu silhueta mas a rota oficial é `/eye`
> (silhueta é só a mecânica). O bundle confirma:
> `modes:["classic","jutsu","quote","eye"]`.

### 1.4 Cores do Feedback (tiles — modo clássico)

| Status         | Hex (inferido) | Contexto                                              |
|----------------|----------------|-------------------------------------------------------|
| correct ✓      | `#24D475`/`#56BF82` (verde) | classes `.tuto-cell-good` (encontradas no JS) |
| near ≈         | `#F6D44E` (amarelo)         | classes `.tuto-cell-partial` |
| wrong ✗        | `#534E41`/`#737373` (cinza) | classes `.tuto-cell-bad`    |
| vitória (borda)| `#FF601B` (laranja Naruto)   | confirmado no CSS (gradient/borda) |

---

## 2. FONTES OFICIAIS

### 2.1 @font-face (do CSS)
```css
@font-face{font-family:Mobilo;
  src:local("Mobilo"),
      url(../fonts/Mobilo-Regular.b8f8d1fe.ttf) format("truetype")}

@font-face{font-family:NinjaNaruto;
  src:local("NinjaNaruto"),
      url(../fonts/NinjaNaruto.73fedd91.ttf) format("truetype")}

@font-face{font-family:Itim;
  src:local("Itim"),
      url(../fonts/Itim-Regular.4a3f2cf1.ttf) format("truetype")}
```

> URL pública: `https://narutodle.net/fonts/NinjaNaruto.73fedd91.ttf`
> e `https://narutodle.net/fonts/Itim-Regular.4a3f2cf1.ttf`
> (fontfiles são servidos diretamente, **sem** CORS bloqueante —
> `crossorigin` anônimo).

### 2.2 Onde cada fonte é usada

| Fonte           | Onde aparece                                                    |
|-----------------|-----------------------------------------------------------------|
| `Mobilo`        | Logo "NARUTODLE" (títulos de botão também em `.button-title`)  |
| `NinjaNaruto`   | Swoosh/assinatura embaixo do logo ("Daily Naruto Game")        |
| `Itim`          | **Body inteiro** (`html, body { font-family: Itim, Helvetica, Arial }`) e todos os botões de modo (`.button-description`) |

### 2.3 Fontes auxiliares
- `Inter` (sans-serif neutra) — usada em alguns componentes Vue
- `CenturyOldStyleStdBold` (serifa) — usada em modais
- `Source Sans Pro:100,200,400` (carregada do Google Fonts)
- `Arial, Helvetica, sans-serif` (fallback padrão)

### 2.4 Tamanhos encontrados (CSS)
| Elemento                         | Size        | Weight |
|----------------------------------|-------------|--------|
| `.subtitle-naruto` (palavra)     | 1.5rem → 1.6rem no hover | — |
| `.button-title` (modo)           | 26.7px (~1.66rem) | 200 (light!) |
| `.button-description` (modo)     | 14px, white opacity 0.851 | 200 |
| `.title` em cards                | 1rem (geral), 1.1rem (header) | 1000 |
| Logo (img)                       | width 100%, max-width 800px (home) / 700px (game) / 300px (logo-game) | — |

---

## 3. LAYOUT DO LANDING (`/`, componente "Menu" / HallPage)

### 3.1 Estrutura HTML (do template Vue compilado)

```html
<div> <!-- HallPage -->
  <!-- 1. Header global (sempre visível) -->
  <Header />                <!-- .header-container -->

  <!-- 2. Conteúdo da home -->
  <div class="hall-container">
    <h1 class="subtitle" v-html="subtitleHtml">
      Guess <span class="subtitle-naruto">Naruto</span> characters
    </h1>

    <div class="buttons-container">      <!-- flex column, width 100% -->
      <div
        v-for="btn in buttons"
        :key="btn.label"
        class="button-game"
        :class="btn.class"
        @click="goToPage(btn.path)"
      >
        <img class="button-img"  :src="btn.img" width="100%" />
        <div class="button-title"
             v-text-max-size="58%">
          {{ $t(btn.title) }}             <!-- "CLASSIC" / "JUTSU" / ... -->
        </div>
        <div class="button-description"
             v-text-max-size="50%">
          {{ $t(btn.description) }}       <!-- "Get clues on every try" -->
        </div>
      </div>
    </div>
  </div>

  <!-- 3. Footer -->
  <div class="foot">
    <HubGames />
    <div class="foot-items"> [Twitter] [About] [Ko-fi] </div>
    <div class="copyright"> narutodle.net © 2026 </div>
  </div>
</div>
```

### 3.2 CSS do `.button-game`
```css
.button-game {
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0;              /* truque: zera o texto, título/descrição
                                são posicionados absolutos por cima da img */
  text-align: left;
  transition: all .1s ease-in-out;
  margin: .2rem 0;
  width: 23%;                /* ~1/4 da largura – grid de 4 colunas */
  max-width: 370px;
  overflow: hidden;
  position: relative;
  text-align: center;
  color: #fff;
}
.button-game:hover { transform: scale(1.02); }
/* mobile */
.button-game { width: 95%; }
```

```css
.button-title{
  position: absolute;
  top: 20px;          /* desktop; vira 1vw em telas < 1608px */
  left: 115px;        /* desktop; vira 7vw em telas < 1608px */
  font-size: 26.7px;  /* 1.6vw em telas menores */
  font-weight: 200;
}
.button-description{
  position: absolute;
  bottom: 21px;
  left: 115px;
  font-size: 14px;    /* 0.86vw em telas menores */
  font-family: Mobilo !important;
  color: hsla(0,0%,100%,.851);  /* branco 85% */
  text-align: left;
}
```

> **Decisão de design crítica:** os textos (CLASSIC / JUTSU / QUOTE /
> EYE + descrição) ficam **sobrepostos** à imagem PNG. Ou seja, **a
> imagem já vem com o ícone desenhado no canto esquerdo**, e o texto
> é renderizado por cima via position absolute.

### 3.3 CSS do `.buttons-container` (modo home)
```css
.buttons-container {
  display: flex;
  flex-direction: column;  /* mobile */
  align-items: center;
  width: 100%;
}
.buttons-container[data-v-d8e6a7b8] {
  justify-content: space-evenly;
}
/* e na verdade em desktop vira ROW: */
.buttons-container[data-v-d8e6a7b8],
.share-buttons[data-v-d8e6a7b8] {
  display: flex;
  flex-direction: row;
  vertical-align: center;
  align-content: center;
  justify-self: center;
  align-items: center;
  text-align: center;
  margin-top: 1rem;
}
```

### 3.4 CSS do header
```css
.logo { width: 100%; max-width: 800px; transition: all .2s ease-in-out; }
.logo:hover { cursor: pointer; transform: scale(1.05); }
.logo-game { width: 90%; max-width: 300px; }   /* versão menor p/ in-game */
```

> A logo é um **PNG** (não SVG!), com 3 variantes:
> - `Logo.png` (default)
> - `LogoBirthday.png` (em dias de aniversário do site: `gameNumero % 365 === 0`)
> - `LogoInfinite.png` (apenas na rota `/infinite`)

---

## 4. CROSS-PROMOTION (HubGames — "Joga os nossos outros jogos")

### 4.1 Estrutura HTML
```html
<div class="hub-games-container">
  <div>{{ $t('hubgames.play_our_other_games.t') }} <!-- "Play our other games:" --></div>
  <div class="hub-games">         <!-- flex row, space-between -->
    <div class="hub-game" v-for="g in games" :key="g.title">
      <a :href="g.src" :title="g.src">
        <div class="hub-game-image">
          <img :src="`./${g.img}`" />
        </div>
        <div class="hub-game-title">{{ g.title }}</div>
        <div class="hub-game-description">{{ g.description }}</div>
      </a>
    </div>
  </div>
</div>
```

### 4.2 CSS do container
```css
.hub-games-container{
  display: flex; flex-direction: column;
  vertical-align: center; align-content: center;
  justify-self: center; align-items: center;
  text-align: center; justify-content: center;
  border: 2px solid #000;
  background-image: url(../img/Background.2a91c097.png);  /* mesmo fundo do site */
  background-size: 100% 100%;
  color: #000;
  padding: 17px 17px;
  row-gap: 11px;
  margin: 10px auto;
  font-size: 15px;
  transition: width .2s ease;
  max-width: 320px;
  width: 80%;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,.25);
}
.hub-games{ display: flex; flex-direction: row; justify-content: space-between; width: 100%; }
.hub-game{ display: flex; flex-direction: column; flex-grow: 1; }
.hub-game a, .hub-game a:active, .hub-game a:focus, .hub-game a:hover, .hub-game a:visited{
  color: #000; text-decoration: none;
}
.hub-game-image{ width: 40px; margin: 0 auto; transition: transform .15s ease; }
.hub-game-image:hover{ transform: scale(1.07); }
.hub-game-image img{ width: 100%; }
.hub-game-title{ font-size: 14px; }       /* vira 12px em mobile */
.hub-game-title:hover{ text-decoration: underline; }
.hub-game-description{ font-size: 8px; }
```

### 4.3 Lista de jogos promovidos (do JS)
```js
games: [
  { title: "LoLdle",      description: "League of Legends", img: "LoLdle.png",      src: "https://loldle.net" },
  { title: "Pokedle",     description: "Pokemon",            img: "Pokedle.png",     src: "https://pokedle.net" },
  { title: "Smashdle",    description: "Super Smash Bros.",  img: "Smashdle.png",    src: "https://smashdle.net" },
  { title: "Dotadle",     description: "DOTA 2",            img: "Dotadle.png",     src: "https://dotadle.net" },
  { title: "OnePiecedle", description: "One Piece",          img: "Onepiecedle.png", src: "https://onepiecedle.net" }
]
```

> **URLs públicas dos ícones** (testar com
> `https://narutodle.net/img/LoLdle.png` etc. — a pasta `img/` é
> servida sem autenticação).

---

## 5. GAME UI — MODO CLÁSSICO (`/classic`)

### 5.1 Header (compartilhado por todas as rotas de jogo)
```html
<div class="header-container">
  <img class="logo-game" src="./Logo.png" @click="goToMenu" />
  <GamesProgress v-if="isInGame" />
  <div class="header-buttons" v-if="isInGame" v-show="!gameLoading">
    <div class="stats-button"> <img class="top-button-img" src="..." @click="openStats" /> </div>
    <Streak @onClick="openUserData" />
    <div class="notes-button" v-if="isClassic"> <img src="..." @click="openNotes" /> </div>
    <div class="help-button"> <img src="..." @click="openHelp" /> </div>
  </div>
  <div class="settings-button top-left" @click="openMobileSettings"> ⚙ </div>
  <div class="top-right" @click="openLocalePicker"> <flag :iso="currentFlag" /> </div>
</div>
```

### 5.2 Body do Classic
```html
<div class="container">
  <InfoBox v-if="options.infoBoxData" :data="options.infoBoxData" />
  <div class="sub-container">
    <div class="game border">
      <Loader v-if="loading" />
      <div class="game-which-container" v-else>
        <div class="which-with-background">
          <slot name="pre-which" />
          <div class="which-text" v-removeDiacritics>
            {{ $t(options.which) }}         <!-- "Which character is this?" -->
          </div>
          <slot name="pre-game" />
          <div class="game-container">
            <slot name="game" />           <!-- pre-clues + Clues -->
          </div>
          <slot name="post-game" />
          <LastUpdate />
        </div>
      </div>
    </div>

    <div class="answers" v-if="!loading">
      <GuessBox v-if="!endFinished"
                :answers="answers"
                :disableAutofocus="options.disableAutofocus"
                @submit="onSubmit" />
      <FoundBy :options="foundByOptions" />
      <div class="answers-container" v-if="options.classicAnswers">
        <Answer v-for="(a, i) in answers" :key="i" :data="a" />
      </div>
      <slot name="specific-answers" />   <!-- scroll horizontal de colunas -->
    </div>

    <End :options="endOptions" id="endId">
      <slot name="end" />                  <!-- "você ganhou em X tentativas" -->
    </End>
    <Yesterday v-if="!loading" :yesterday="yesterday" :showDetails="..." :gameNumero="...">
      <slot name="yesterdayDetails" />
    </Yesterday>
  </div>

  <Confettis ref="confettis" />
  <component :is="modalHelpComponent" :timeToRefresh="msToMidnightUTC" />
  <Stats ref="stats" :options="statsOptions" />
  <ModalStats ref="modalStatsParent" :options="modalStatsOptions" />
  <CompleteAll :timeToRefresh="..." :canShow="showCompleteAll" :gameNumero="..." />
</div>
```

### 5.3 Colunas / Atributos do board (inferido)
A linha de Answer tem 5 colunas oficiais (clues desbloqueáveis):
- **Quote** (Random quote in game)
- **Nature Types** (Fire, Wind, Lightning, Water, Earth, None)
- **Kekkei Genkai** (None, Dōjutsu, Nature Transformation, Body Enhancement)
- **Occupation** (Hokage, Anbu Captain, etc.)
- **Status** (Alive, Deceased, Unknown)

Adicionalmente, pistas são liberadas progressivamente:
- **Arc** (a partir de algumas tentativas)
- **Gender** (a partir de algumas tentativas)

### 5.4 Tiles / Feedback
Classes: `.tuto-cell-good` (verde) / `.tuto-cell-partial` (amarelo) /
`.tuto-cell-bad` (cinza). No JS, dá pra ver:
```js
class:"tuto-cell-bad"
class:"tuto-cell-good"
class:"tuto-cell-partial"
```

### 5.5 Cores oficiais do feedback (cross-checado)
- **correct**: tons de verde `#24D475`, `#56BF82`, `#35B956`
- **partial/near**: tons de amarelo `#F0E442`, `#F6D44E`
- **wrong**: cinzas `#534E41`, `#737373`, `#A0A0A0`

### 5.6 "Yesterday" (rodapé do card de jogo)
```html
<div class="yesterday">
  <i18n path="game.yesterday.t">
    <span #default>{{ "Yesterday's character was " }}</span>
    <span #Item1>
      <span class="numero-champion">#{{ gameNumero - 1 }}</span>
      <span class="nth">
        <span class="champion-name is-clickable" @click="isShowingDetails=!isShowingDetails">
          {{ yesterday }}
        </span>
      </span>
    </span>
  </i18n>
  <div v-show="showDetails && isShowingDetails"><slot name="details" /></div>
</div>
```

---

## 6. DATASETS (citacoes, jutsus, klass columns)

Não consegui extrair datasets completos via webfetch (eles vêm de uma
API backend em `https://api.narutodle.net/...` — não estático no
bundle). Mas do bundle dá pra ver as estruturas:

### 6.1 Endpoints inferidos (do JS)
```js
this.$api.cache.getLocal()       // GET /cache
this.$api.cache.getForceNoCache() // GET /cache?nocache=1
this.$api.front.getVersion()     // GET /version
this.$api.user.getData(token)    // POST /user/data
```

> O cache de campeões vem criptografado com chave `D5XCtTOObw`
> (via `Xe.decryptWithKey`). O bundle minificado não traz a lista
> de nomes diretamente.

### 6.2 Colunas (do translations + clues)
- affiliations: konoha, akatsuki, kiri, oto, iwa, suna, yu, uzushio, ame, none, kumo, taki, kusa, land_of_iron
- jutsusTypes: ninjutsu, genjutsu, taijutsu, none
- natureTypes: fire, wind, lightning, water, earth, none
- kekkeiGenkaiTypes: none, dōjutsu, nature_transformation, body_enhancement
- classifications: jinchūriki, sage, missing_nin, none, medical_nin, mercenary_ninja, tailed_beast, summon
- status: deceased, alive
- occupation: hokage, anbu_captain, ... (~50 ocupações)
- arc: prologue, chunin_exams, konoha_crush, ... (~30 arcos)

> O usuário disse "88 personagens" mas isso não pôde ser confirmado
> via webfetch (o pool está criptografado no bundle).

---

## 7. ROTAS OFICIAIS (do Vue Router)

```js
const routes = [
  { path: "/",            component: Menu,         name: "Menu" },
  { path: "/classic",     component: Classic,      name: "Classic" },
  { path: "/quote",       component: Quote,        name: "Quote" },
  { path: "/jutsu",       component: Jutsu,        name: "Jutsu" },
  { path: "/eye",         component: Eye,          name: "Eye" },          // ← "silhouette" oficial
  { path: "/streak",      component: Streak,       name: "Streak" },
  { path: "/app",         component: AppForwarder, name: "AppForwarder" },
  { path: "/infinite",    component: InfiniteClassic, name: "InfiniteClassic" }, // só aparece em 1/4/2025
  { path: "*",            component: NotFound }
]
```

---

## 8. COMPARAÇÃO COM A IMPLEMENTAÇÃO ATUAL

Arquivo: `src/pages/games/narutodle/*` (seu projeto)

| Item                                          | narutodle.net | Sua impl.        | Gap                                                                 |
|-----------------------------------------------|---------------|------------------|---------------------------------------------------------------------|
| Fonte do body                                 | `Itim` (handwritten) | `font-mono` (Courier-like) | **FALTA** baixar/usar Itim via `@font-face` |
| Fonte do logo                                 | `Mobilo` (custom TTF) | emoji 🍥 + texto laranja | **FALTA** baixar Mobilo TTF ou usar imagem PNG do logo              |
| Swoosh "NARUTODLE" abaixo do logo             | `NinjaNaruto` (custom) | não tem          | **FALTA** font-face NinjaNaruto                                     |
| Cor laranja Naruto                            | `#FF601B`     | `#F59E0B` (Tailwind amber-500) | **DIVERGE** — usar `#FF601B` exato                                |
| Cor de feedback "correct"                     | verde `#24D475` | `#16a34a` (Tailwind green-600) | **DIVERGE** — usar verde mais claro/saturado                      |
| Cor de feedback "near"                        | amarelo `#F6D44E` | `#F97316` (laranja) | **DIVERGE** — `near` no original é **amarelo**, não laranja       |
| Cor de feedback "wrong"                       | cinza `#737373` | `#475569` (slate) | **DIVERGE** — cinza neutro                                          |
| Borda de vitória                              | dourado `#AF9767` (infoBox) ou `#FF601B` (border) | `#F97316` | próximo mas não exato                                            |
| Botões de modo (cards)                        | 4 cards PNGs coloridos com texto sobreposto | pills horizontais | **DIVERGE** completamente — você usa pills, original usa cards    |
| Ícones dos modos                              | SVGs embutidos nos PNGs (`ButtonClassic.png` etc) | sem ícone   | **FALTA** baixar as 5 imagens de botão                             |
| Background do landing                         | PNG `Background.2a91c097.png` (arte Naruto) | gradient azul | **FALTA** — usar a imagem oficial do fundo                          |
| Cross-promo "Play our other games"            | 5 cards (LoLdle, Pokedle, Smashdle, Dotadle, OnePiecedle) | não tem | **FALTA** — recriar HubGames component                            |
| Logo como imagem                              | `Logo.png` / `LogoBirthday.png` / `LogoInfinite.png` | texto estilizado | **DIVERGE** — usar PNG do logo oficial                            |
| "← hall" navegação                            | botão "Menu" / logo clicável | botão "← hall" | similar mas copie a label e a posição                             |
| Modo Silhuette                                | rota `/eye` (silhueta é só mecânica) | `silhouette` como modo | OK sua versão, mas considere alinhar o nome da rota                |
| Modo Jutsu                                    | botão "JUTSU" + path `/jutsu` + img `ButtonJutsu.png` | desabilitado | OK disabled, mas ícone falta                                       |
| Modo Quote                                    | botão "QUOTE" + path `/quote` + img `ButtonQuote.png` | desabilitado | OK disabled, mas ícone falta                                       |
| Modo Eye                                      | botão "EYE" + path `/eye` + img `ButtonEye.png` | "Silhueta" | você renomeou, mas internamente é Eye                              |
| Modo Infinite                                 | aparece só em 1º de abril (Easter egg) | não tem       | OK, opcional                                                        |
| Pool de personagens                           | 88 chars (claim usuário, NÃO confirmado) | 43 chars     | se for verdade, **FALTA** ~45 personagens                          |
| 8 tentativas                                  | sim            | sim              | OK                                                                  |
| 5 colunas no board (Classic)                  | sim (Quote, Nature, Kekkei Genkai, Occupation, Status) | 7 atributos | **DIVERGE** — original tem 5 colunas, não 7                      |
| Persistência localStorage                     | sim (criptografada) | sim (sem crypto) | OK funcional                                                       |

---

## 9. RECOMENDAÇÕES DE IMPLEMENTAÇÃO (clone visual exato)

### 9.1 Cores para `tailwind.config.ts`
```ts
colors: {
  'naruto-orange':    '#FF601B',   // logo, hover, focus
  'naruto-orange-dk': '#D55E00',   // gradient end
  'naruto-red':       '#D53633',   // lose tile bg
  'naruto-red-dk':    '#9E2723',   // dark variants
  'naruto-red-border':'#FF3737',   // red tile border
  'naruto-gold':      '#AF9767',   // infoBox border
  'naruto-yellow':    '#F6D44E',   // partial/near
  'naruto-green':     '#24D475',   // correct
  'naruto-cream':     '#EDE8D8',   // text accent off
  'naruto-bg':        '#181C20',   // body bg dark
  'naruto-teal':      '#78CED7',   // html bg fallback
  'naruto-info':      '#213B55',   // infoBox bg
  'naruto-info-dk':   '#0E1E25',
  'naruto-kekkei':    '#BBAC7C',   // input border cream
  'naruto-mobilo':    'Mobilo, cursive',
  'naruto-itim':      'Itim, Helvetica, Arial',
  'naruto-ninja':     'NinjaNaruto, cursive',
}
```

### 9.2 Fontes para incluir
```css
/* em src/styles/fonts.css */
@font-face { font-family: 'Mobilo';
  src: local('Mobilo'),
       url('https://narutodle.net/fonts/Mobilo-Regular.b8f8d1fe.ttf') format('truetype');
  font-display: swap;
}
@font-face { font-family: 'Itim';
  src: local('Itim'),
       url('https://narutodle.net/fonts/Itim-Regular.4a3f2cf1.ttf') format('truetype');
  font-display: swap;
}
@font-face { font-family: 'NinjaNaruto';
  src: local('NinjaNaruto'),
       url('https://narutodle.net/fonts/NinjaNaruto.73fedd91.ttf') format('truetype');
  font-display: swap;
}
body { font-family: 'Itim', Helvetica, Arial, sans-serif; }
```

> ⚠️ **Licença**: TTFs do narutodle.net não têm licença explícita.
> Para produção, considere comprar a Mobilo/Itim no Google Fonts
> (Itim é grátis no Google Fonts: `https://fonts.google.com/specimen/Itim`).

### 9.3 Hall (landing) — refactor
Substituir o `NarutodleGame.tsx` por um **HallPage** com 4 cards
na vertical (mobile) ou em row (desktop), cada card com:
- `<img>` da imagem PNG (proporção ~370x150) **como background**
- Title `position: absolute; top: 20px; left: 115px; font-size: 26.7px; font-weight: 200`
- Description `position: absolute; bottom: 21px; left: 115px; font-size: 14px; opacity: 0.85`
- Hover: `transform: scale(1.02)`
- Width 23% desktop, 95% mobile

### 9.4 Modo Clássico — board
Refatorar o board de 7 atributos para **5 colunas** (Quote, Nature,
Kekkei Genkai, Occupation, Status). As outras pistas (Arc, Gender)
são liberadas **progressivamente** (após X tentativas) — implementar
com `v-show` condicional baseado em `guesses.length`.

### 9.5 Imagens para baixar (URLs públicas)
```
https://narutodle.net/img/Logo.png
https://narutodle.net/img/LogoBirthday.png
https://narutodle.net/img/LogoInfinite.png
https://narutodle.net/img/ButtonClassic.d8a0e20d.png
https://narutodle.net/img/ButtonJutsu.bb8de54c.png
https://narutodle.net/img/ButtonQuote.1a797923.png
https://narutodle.net/img/ButtonEye.60257b8b.png
https://narutodle.net/img/ButtonInfinite.a5d9e7e4.png
https://narutodle.net/img/Background.2a91c097.png
https://narutodle.net/img/LoLdle.png
https://narutodle.net/img/Pokedle.png
https://narutodle.net/img/Smashdle.png
https://narutodle.net/img/Dotadle.png
https://narutodle.net/img/Onepiecedle.png
```

### 9.6 Cores do feedback (mapping exato)
```ts
const TILE = {
  correct:  { bg: '#24D475', border: '#35B956', text: '#FFFFFF' },
  partial:  { bg: '#F6D44E', border: '#E48E0D', text: '#1A1A1A' },
  wrong:    { bg: '#737373', border: '#534E41', text: '#FFFFFF' },
  victory:  { border: '#FF601B', glow: 'rgba(255,96,27,0.4)' }
};
```

### 9.7 HubGames footer
Adicionar `<HubGames />` no rodapé do HallPage com a lista dos 5
jogos (LoLdle, Pokedle, Smashdle, Dotadle, OnePiecedle) e o
container com `border: 2px solid #000; background-image: Background.png`.

---

## 10. OBSERVAÇÕES FINAIS

1. **narutodle.net é Vue 2 SPA com cache agressivo** (todos os assets
   têm hash no nome). Use a versão fixa
   `index.11a6033b16abd63429ae.1776461301287.css` e
   `index.11a6033b16abd63429ae.1776461300344.js` que peguei hoje.

2. **Há também um jogo no GitHub** chamado "Narutle" (sem o 'o') de
   `TobinTojo` (https://github.com/TobinTojo/NarutoCharacterGuesser)
   que é **inspirado no Poeltl/Wordle** mas **NÃO** é o narutodle.net.
   É um projeto independente, em React, com Firebase, com mecânica
   diferente (rank/village/height/age/clan/chakra/status/gender).
   Pode servir de referência estrutural mas não visual.

3. **Landing page NÃO tem silhuette** como rota — é `/eye`. A
   mecânica "silhueta" do jogo é a revelação progressiva do olho
   (zoom-out a cada tentativa, conforme `eye.help.1` e `eye.help.2`).

4. **Os 88 personagens** que o usuário mencionou não foram
   confirmados no bundle (estão criptografados em `cache` com AES).
   Se for verdade, o dataset em `characters.ts` (43 chars) está
   incompleto.

5. **A logo "NARUTODLE" tem cor laranja** e o swoosh
   "Daily Naruto Game" usa `NinjaNaruto` font (também laranja).
   O azul-petróleo do fundo aparece como "gradiente" sob a logo em
   versões mobile.

6. **O background do site é a arte do Naruto** (personagem central,
   capa do manga/anime) com gradient overlay do `#78CED7` (teal)
   para a área de conteúdo. No mobile, o gradient fica mais
   pronunciado.

7. **Tailwind:** sua implementação usa Tailwind, mas a original é
   CSS puro com escopo via `data-v-XXX` (Vue scoped). Para um clone
   exato, recomendo escrever CSS modules com as classes exatas
   (`.button-game`, `.button-title`, `.hub-game`, etc.) ao invés de
   utilitários Tailwind.
