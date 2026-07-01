// src/pages/games/loldle/quotes/ability.ts
//
// Map<championId, string[]> com nome de abilities (Q/W/E/R/Passive).
// Pool menor que o Classic (~32 campeoes) para evitar complexidade
// excessiva. Os campeoes com KG visualmente reconhecivel foram
// priorizados. Campeoes fora do map nao estao disponiveis no modo Ability.
//
// Modo Ability: o jogador recebe as abilities do campeao-alvo e
// tenta adivinhar de quem e em ate 8 tentativas.

export const CHAMPION_ABILITIES: Record<string, string[]> = {
  aatrox: ['Q: The Darkin Blade', 'W: Infernal Chains', 'E: Umbral Dash', 'R: World Ender', 'P: Deathbringer Stance'],
  ahri: ['Q: Orb of Deception', 'W: Fox-Fire', 'E: Charm', 'R: Spirit Rush', 'P: Essence Theft'],
  akali: ['Q: Five Point Strike', 'W: Twilight Shroud', 'E: Shuriken Flip', 'R: Perfect Execution', 'P: Assassin\'s Mark'],
  ashe: ['Q: Ranger\'s Focus', 'W: Volley', 'E: Hawkshot', 'R: Enchanted Crystal Arrow', 'P: Frost Shot'],
  caitlyn: ['Q: Piltover Peacemaker', 'W: Yordle Snap Trap', 'E: 90 Caliber Net', 'R: Ace in the Hole', 'P: Headshot'],
  darius: ['Q: Decimate', 'W: Crippling Strike', 'E: Apprehend', 'R: Noxian Guillotine', 'P: Hemorrhage'],
  diana: ['Q: Crescent Strike', 'W: Pale Cascade', 'E: Lunar Rush', 'R: Moonfall', 'P: Moonsilver Blade'],
  ekko: ['Q: Timewinder', 'W: Parallel Convergence', 'E: Phase Dive', 'R: Chronobreak', 'P: Z-Drive Resonance'],
  ezreal: ['Q: Mystic Shot', 'W: Essence Flux', 'E: Arcane Shift', 'R: Trueshot Barrage', 'P: Rising Spell Force'],
  fiora: ['Q: Lunge', 'W: Riposte', 'E: Bladework', 'R: Grand Challenge', 'P: Duelist\'s Dance'],
  garen: ['Q: Decisive Strike', 'W: Courage', 'E: Judgment', 'R: Demacian Justice', 'P: Perseverance'],
  gwen: ['Q: Snip Snip!', 'W: Hallowed Mist', 'E: Skip \'n Slash', 'R: Needlework', 'P: Thousand Cuts'],
  jinx: ['Q: Switcheroo!', 'W: Zap!', 'E: Flame Chompers!', 'R: Super Mega Death Rocket!', 'P: Get Excited!'],
  kai_sa: ['Q: Icathian Rain', 'W: Void Seeker', 'E: Supercharge', 'R: Killer Instinct', 'P: Second Skin'],
  katarina: ['Q: Bouncing Blade', 'W: Preparation', 'E: Shunpo', 'R: Death Lotus', 'P: Voracity'],
  lee_sin: ['Q: Sonic Wave / Resonating Strike', 'W: Safeguard / Iron Will', 'E: Tempest / Cripple', 'R: Dragon\'s Rage', 'P: Flurry'],
  leona: ['Q: Shield of Daybreak', 'W: Eclipse', 'E: Zenith Blade', 'R: Solar Flare', 'P: Sunlight'],
  lucian: ['Q: Piercing Light', 'W: Ardent Blaze', 'E: Relentless Pursuit', 'R: The Culling', 'P: Lightslinger'],
  lux: ['Q: Light Binding', 'W: Prismatic Barrier', 'E: Lucent Singularity', 'R: Final Spark', 'P: Illumination'],
  malphite: ['Q: Seismic Shard', 'W: Thunderclap', 'E: Ground Slam', 'R: Unstoppable Force', 'P: Granite Shield'],
  master_yi: ['Q: Alpha Strike', 'W: Meditate', 'E: Wuju Style', 'R: Highlander', 'P: Double Strike'],
  miss_fortune: ['Q: Double Up', 'W: Strut', 'E: Make It Rain', 'R: Bullet Time', 'P: Love Tap'],
  morgana: ['Q: Dark Binding', 'W: Tormented Shadow', 'E: Black Shield', 'R: Soul Shackles', 'P: Soul Siphon'],
  nasus: ['Q: Siphoning Strike', 'W: Wither', 'E: Spirit Fire', 'R: Fury of the Sands', 'P: Soul Eater'],
  orianna: ['Q: Command: Attack', 'W: Command: Dissonance', 'E: Command: Protect', 'R: Command: Shockwave', 'P: Clockwork Windup'],
  riven: ['Q: Broken Wings', 'W: Ki Burst', 'E: Valor', 'R: Blade of the Exile', 'P: Runic Blade'],
  senna: ['Q: Piercing Darkness', 'W: Last Embrace', 'E: Curse of the Black Mist', 'R: Dawning Shadow', 'P: Absolution'],
  sivir: ['Q: Boomerang Blade', 'W: Ricochet', 'E: Spell Shield', 'R: On The Hunt', 'P: Fleet of Foot'],
  teemo: ['Q: Blinding Dart', 'W: Move Quick', 'E: Toxic Shot', 'R: Seed Trap', 'P: Guerrilla Warfare'],
  thresh: ['Q: Death Sentence', 'W: Dark Passage', 'E: Flay', 'R: The Box', 'P: Damnation'],
  vayne: ['Q: Tumble', 'W: Silver Bolts', 'E: Condemn', 'R: Final Hour', 'P: Night Hunter'],
  yasuo: ['Q: Steel Tempest', 'W: Wind Wall', 'E: Sweeping Blade', 'R: Last Breath', 'P: Way of the Wanderer'],
  zed: ['Q: Razor Shuriken', 'W: Living Shadow', 'E: Shadow Slash', 'R: Death Mark', 'P: Contempt for the Weak'],
}

/**
 * IDs dos campeoes disponiveis no modo Ability.
 */
export const ABILITY_POOL_CHAMPION_IDS: string[] = Object.keys(CHAMPION_ABILITIES)

/**
 * Retorna a lista de abilities formatada (Q/W/E/R/P) para o campeao.
 * Usado pela UI para mostrar as pistas no modo Ability.
 */
export function getAbilitiesForChampion(championId: string): string[] {
  return CHAMPION_ABILITIES[championId] ?? []
}
