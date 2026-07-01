// src/pages/games/narutodle/jutsu/jutsu.ts
//
// Map<characterId, string[]> com jutsus conhecidos por personagem.
// 1-3 jutsus por personagem. Quando o personagem nao tem jutsus
// canonicos bem definidos ou nao tem jutsu proprio, usa-se um
// placeholder generico para nao quebrar a pool.

export const CHARACTER_JUTSUS: Record<string, string[]> = {
  naruto: ['Rasengan', 'Kage Bunshin no Jutsu', 'Sage Mode'],
  sasuke: ['Chidori', 'Katon: Goukakyuu no Jutsu', 'Susanoo'],
  sakura: ['Cherry Blossom Impact', 'Healing Technique'],
  kakashi: ['Chidori', 'Raikiri', 'Kamui'],
  itachi: ['Tsukuyomi', 'Amaterasu', 'Susanoo (Yata Mirror / Totsuka Blade)'],
  madara: ['Infinite Tsukuyomi', 'Susanoo', 'Limbo: Border Jail'],
  hashirama: ['Wood Release: Deep Forest Emergence', 'Sage Art: Wood Dragon'],
  tobirama: ['Flying Thunder God', 'Water Release: Water Dragon Bullet'],
  minato: ['Rasengan', 'Flying Thunder God (Hiraishin)'],
  kushina: ['Adamantine Sealing Chains', 'Uzumaki Chakra Chains'],
  jiraiya: ['Rasengan', 'Sage Mode (Toad)', 'Toad Oil Bullet'],
  tsunade: ['Mitotic Regeneration', 'Creation Rebirth', "Hundred Healings"],
  orochimaru: ['Summoning: Manda', 'Hidden Shadow Snake Hands'],
  kabuto: ['Sage Mode (Snake)', 'Chakra Scalpel'],
  shisui: ['Kotoamatsukami', 'Body Flicker'],
  gaara: ['Sabaku Taiso (Sand Armor)', 'Sand Prison Burial'],
  temari: ['Summoning: Kamatari', 'Wind Release: Great Breakthrough'],
  kankuro: ['Karasu (Crow Puppet)', 'Black Secret Technique'],
  lee: ['Eight Inner Gates', 'Reverse Lotus'],
  neji: ['Byakugan', 'Eight Trigrams: 64 Palms', 'Gentle Step: Twin Lion Fists'],
  tenten: ['Summoning: Bashosen', 'Twin Rising Dragons'],
  hinata: ['Byakugan', 'Gentle Step: Twin Lion Fists', 'Protection Wall Fist'],
  ino: ['Mind Body Switch', 'Mind Transfer Clone'],
  shikamaru: ['Shadow Imitation', 'Shadow Strangle'],
  choji: ['Expansion Jutsu', 'Butterfly Mode'],
  shino: ['Insect Clone', 'Parasitic Insect Jutsu'],
  kiba: ['Beast Human Clone: Three Heads', 'Fang Passing Fang'],
  akamaru: ['Fang Passing Fang', 'Dynamic Marking'],
  sai: ['Super Beast Imitating Drawing', 'Lion Hurricane'],
  yamato: ['Wood Release: Hokage-Style Sixty-Year-Old Technique'],
  asuma: ['Fire Release: Ash Pile Burning', 'Wind Release: Dust Cloud'],
  kurenai: ['Genjutsu: Flower Tree World'],
  hidan: ['Ritual: Jashin Feast', 'Immortality Curse'],
  kakuzu: ['Earth Grudge: Bullet Shot', 'Fire Release: Intelligent Hard Work'],
  deidara: ['Explosive Clay: C1', 'Explosive Clay: C4 (Karura)'],
  sasori: ['Iron Sand: World Method', 'Puppet: Hiruko'],
  konan: ['Paper Person of God Technique', 'Origami'],
  pain: ['Shinra Tensei', 'Chibaku Tensei', 'Six Paths techniques'],
  obito: ['Kamui', 'Space-Time Ninjutsu', 'Fire Release: Exploding Flame Shot'],
  'killer-b': ['Lariat', 'Eight Tails partial transformation'],
  ay: ['Lightning Release: Chakra Mode', 'Lariat'],
  mei: ['Lava Release', 'Boil Release: Skilled Mist'],
  onoki: ['Dust Release: Detachment of the Primitive World', 'Earth Release: Super Light-Weight Rock'],

  // === placeholders para personagens sem jutsus proprias (agent A) ===
  hiruzen: ['Fire Release: Fire Dragon Bullet', 'Summoning: Enma'],
  kaguya: ['Rabbit Hair Needle', 'All-Killing Ash Bones'],
  kisame: ['Water Prison Jutsu', 'Samehada: Absorption'],
  zetsu: ['Spore Technique', 'Substitute Grass'],
  blackzetsu: ['Will Manipulation', 'Infusion'],
  izuna: ['Fire Release: Great Fire Annihilation', 'Tomegane no Jutsu'],
  fugaku: ['Fire Release: Great Fireball', 'Sharingan mastery'],
  hiashi: ['Byakugan', 'Gentle Fist: Eight Trigrams 64 Palms'],
  hanabi: ['Byakugan', 'Gentle Step: Twin Lion Fists'],
  'maito_gai': ['Eight Inner Gates', 'Dynamic Entry'],
  anko: ['Snake summon', 'Orochimaru-style jutsu'],
  kurenai2: ['Genjutsu: Flower Tree World', 'Binding Illusion'],
  iruka: ['Transformation Jutsu', 'Basic Academy techniques'],
  konohamaru: ['Rasengan', 'Sexy Technique'],
  shizune: ['Medical Ninjutsu', 'Poison Mist'],
  danzou: ['Izanagi', 'Wind Release: Vacuum Blade'],
  sakumo: ['White Light Blade', 'Chidori precursor'],
  rin: ['Medical Ninjutsu', 'Water Release'],
  mito_uzumaki: ['Adamantine Sealing Chains', 'Uzumaki sealing jutsu'],
  kimimaro: ['Dance of the Larch', 'Bone manipulation'],
  tayuya: ['Demonic Flute: Phantom Sound 9', 'Sound-based genjutsu'],
  kidomaru: ['Spider Sticky Golden Web', 'Bow and Arrow: Destruction'],
  sakon: ['Merging Curse Mark', 'Physical enhancement'],
  jirobo: ['Earth Release: Antlion Swamp', 'Taijutsu boost'],
  dosu: ['Sound Long Range Attack', 'Resonance'],
  kin: ['Lava Release: Quicklime Congealing', 'Poison techniques'],
  zabuza: ['Hidden Mist Jutsu', 'Water Release: Water Dragon'],
  haku: ['Ice Release: Crystal Ice Mirrors', 'Senbon needles'],
  utakata: ['Boil Release: Unrivalled Scale Armor', 'Bubble techniques'],
  yagura: ['Water Release', 'Three-Tails control'],
  darui: ['Storm Release: Laser Circus', 'Black Lightning'],
  cee: ['Storm Release', 'Lightning affinity'],
  samui: ['Lightning Release', 'Kenjutsu'],
  yugito: ['Fire Release: Flame Bullet', 'Two-Tails partial transformation'],
  mifune: ['Kenjutsu mastery', 'Iaido techniques'],
  roshi: ['Lava Release: Scorching Armour', 'Fire Release'],
  kuusuke: ['Earth Release', 'Explosive tags'],
  hakui: ['Ice Release', 'Senbon needles'],
  shigure: ['Water Release: Water Fang Bullet'],
  genma: ['Ice Release', 'Sword of the Storm'],
  ebisu: ['Summoning: Toad', 'Basic techniques'],
  raido: ['Earth Release: Hiding Like a Mole', 'Taijutsu'],
  fugaku2: ['Fire Release: Great Fireball', 'Sharingan mastery'],
  madara2: ['Infinite Tsukuyomi', 'Ten-Tails jinchuriki techniques'],
}

/**
 * Escolhe uma combinacao de jutsus (1-3) deterministica por dateKey.
 * Retorna array com 1 jutsu para feedback rapido.
 */
export function getJutsusForCharacter(characterId: string): string[] {
  return CHARACTER_JUTSUS[characterId] ?? []
}

/**
 * Escolhe 1 jutsu (ou 1-3) deterministico por dateKey para o modo Jutsu.
 * Hash simples sobre characterId + dateKey -> index do jutsu.
 */
export function getJutsuClueForCharacterForDate(
  characterId: string,
  dateKey: string
): string {
  const list = CHARACTER_JUTSUS[characterId]
  if (!list || list.length === 0) {
    return `[jutsu do personagem ${characterId}]`
  }
  let h = 0x811c9dc5
  const seed = `${characterId}::${dateKey}`
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  const idx = h % list.length
  return list[idx]
}
