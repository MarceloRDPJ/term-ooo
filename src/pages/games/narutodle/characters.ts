// src/pages/games/narutodle/characters.ts

import type { NarutodleCharacter } from './types'

const none = ['None']

export const NARUTO_CHARACTERS: NarutodleCharacter[] = [
  c('naruto', 'Naruto Uzumaki', 'Male', ['Konoha'], ['Ninjutsu', 'Taijutsu'], none, ['Wind'], ['Jinchuriki', 'Sage'], 'Prologue', 'Alive', ['Rasengan', 'Shadow Clone Jutsu', 'Sage Mode'], ['I never go back on my word.', 'I will become Hokage.'], 'blue determined eyes'),
  c('sasuke', 'Sasuke Uchiha', 'Male', ['Konoha', 'Oto'], ['Ninjutsu', 'Taijutsu'], ['Dojutsu'], ['Fire', 'Lightning'], none, 'Prologue', 'Alive', ['Chidori', 'Amaterasu', 'Susanoo'], ['I have long since closed my eyes.', 'My only goal is in the darkness.'], 'dark sharingan stare'),
  c('sakura', 'Sakura Haruno', 'Female', ['Konoha'], ['Ninjutsu', 'Taijutsu'], none, none, ['Medical-nin'], 'Prologue', 'Alive', ['Creation Rebirth', 'Chakra Enhanced Strength'], ['I finally caught up with them.', 'I will protect them this time.'], 'green focused eyes'),
  c('kakashi', 'Kakashi Hatake', 'Male', ['Konoha'], ['Ninjutsu', 'Taijutsu'], ['Dojutsu'], ['Lightning', 'Earth', 'Water', 'Fire'], none, 'Prologue', 'Alive', ['Lightning Blade', 'Kamui', 'Chidori'], ['Those who abandon their friends are worse than scum.', 'Sorry I am late.'], 'single visible sleepy eye'),
  c('itachi', 'Itachi Uchiha', 'Male', ['Akatsuki', 'Konoha'], ['Genjutsu', 'Ninjutsu'], ['Dojutsu'], ['Fire', 'Water'], ['Missing-nin'], 'Prologue', 'Deceased', ['Tsukuyomi', 'Amaterasu', 'Susanoo'], ['You do not become the Hokage to be acknowledged.', 'Forgive me.'], 'calm red sharingan'),
  c('madara', 'Madara Uchiha', 'Male', ['Konoha'], ['Ninjutsu', 'Taijutsu'], ['Dojutsu'], ['Fire', 'Wind', 'Lightning', 'Earth', 'Water'], none, 'Fourth Shinobi World War: Confrontation', 'Deceased', ['Perfect Susanoo', 'Limbo', 'Fire Release: Majestic Destroyer Flame'], ['Wake up to reality.', 'Do you want these clones to use Susanoo?'], 'ancient rinnegan glare'),
  c('obito', 'Obito Uchiha', 'Male', ['Akatsuki', 'Konoha'], ['Ninjutsu'], ['Dojutsu'], ['Fire', 'Earth', 'Water'], ['Missing-nin'], 'Kakashi Gaiden', 'Deceased', ['Kamui', 'Fire Release: Blast Wave Wild Dance'], ['In the ninja world those who break the rules are scum.', 'I am no one.'], 'masked mismatched eyes'),
  c('hinata', 'Hinata Hyuga', 'Female', ['Konoha'], ['Taijutsu'], ['Dojutsu'], ['Lightning', 'Fire'], none, 'Chunin Exams', 'Alive', ['Byakugan', 'Gentle Step Twin Lion Fists'], ['I never go back on my word either.', 'I want to stand beside Naruto.'], 'pale byakugan eyes'),
  c('shikamaru', 'Shikamaru Nara', 'Male', ['Konoha'], ['Ninjutsu'], none, ['Yin'], none, 'Chunin Exams', 'Alive', ['Shadow Imitation', 'Shadow Strangle'], ['What a drag.', 'Sometimes I wish I was just a cloud.'], 'bored narrow eyes'),
  c('gaara', 'Gaara', 'Male', ['Suna'], ['Ninjutsu'], none, ['Wind', 'Earth', 'Lightning'], ['Jinchuriki'], 'Chunin Exams', 'Alive', ['Sand Burial', 'Sand Shield'], ['I fight for my friends.', 'Love gave birth to hate.'], 'ringed pale eyes'),
  c('rock-lee', 'Rock Lee', 'Male', ['Konoha'], ['Taijutsu'], none, none, none, 'Chunin Exams', 'Alive', ['Eight Gates', 'Front Lotus'], ['A dropout can beat a genius through hard work.', 'I want to prove myself.'], 'round intense eyes'),
  c('neji', 'Neji Hyuga', 'Male', ['Konoha'], ['Taijutsu'], ['Dojutsu'], ['Fire', 'Earth', 'Water'], none, 'Chunin Exams', 'Deceased', ['Byakugan', 'Eight Trigrams Sixty-Four Palms'], ['A bird trapped in a cage cannot fly.', 'Fate can be changed.'], 'stern byakugan eyes'),
  c('jiraiya', 'Jiraiya', 'Male', ['Konoha'], ['Ninjutsu', 'Taijutsu'], none, ['Fire', 'Earth', 'Water', 'Wind'], ['Sage'], 'Search for Tsunade', 'Deceased', ['Rasengan', 'Toad Sage Mode'], ['A tale is only good as its final turn.', 'The true measure of a shinobi is not how he lives.'], 'red marked sage eyes'),
  c('tsunade', 'Tsunade', 'Female', ['Konoha'], ['Ninjutsu', 'Taijutsu'], none, ['Lightning', 'Earth', 'Water', 'Fire'], ['Medical-nin'], 'Search for Tsunade', 'Alive', ['Creation Rebirth', 'Ninja Art: Mitotic Regeneration'], ['People become stronger because they have memories.', 'I am the Fifth Hokage.'], 'brown confident eyes'),
  c('orochimaru', 'Orochimaru', 'Other', ['Oto', 'Akatsuki', 'Konoha'], ['Ninjutsu'], none, ['Wind', 'Earth', 'Fire'], ['Missing-nin'], 'Chunin Exams', 'Alive', ['Summoning: Manda', 'Hidden Shadow Snake Hands'], ['The body ages, but knowledge is eternal.', 'I want to learn every jutsu.'], 'gold snake eyes'),
  c('minato', 'Minato Namikaze', 'Male', ['Konoha'], ['Ninjutsu'], none, ['Fire', 'Wind', 'Lightning'], ['Jinchuriki', 'Sage'], 'Kakashi Gaiden', 'Deceased', ['Flying Thunder God', 'Rasengan'], ['A parent always believes in their child.', 'The Yellow Flash has arrived.'], 'bright blue calm eyes'),
  c('hashirama', 'Hashirama Senju', 'Male', ['Konoha'], ['Ninjutsu', 'Taijutsu'], ['Nature Transformation'], ['Earth', 'Water'], ['Sage'], 'Fourth Shinobi World War: Climax', 'Deceased', ['Wood Release: Deep Forest Emergence', 'Sage Art Wood Dragon'], ['The village is something precious.', 'I will protect our children.'], 'warm ancient eyes'),
  c('tobirama', 'Tobirama Senju', 'Male', ['Konoha'], ['Ninjutsu'], none, ['Water'], none, 'Fourth Shinobi World War: Climax', 'Deceased', ['Flying Thunder God', 'Water Dragon Bullet'], ['The village must be protected.', 'I created many jutsu.'], 'red stern eyes'),
  c('deidara', 'Deidara', 'Male', ['Akatsuki', 'Iwa'], ['Ninjutsu'], ['Nature Transformation'], ['Earth', 'Lightning'], ['Missing-nin'], 'Kazekage Rescue Mission', 'Deceased', ['Explosive Clay C1', 'C4 Karura'], ['Art is an explosion.', 'My art is fleeting beauty.'], 'blue artist eye'),
  c('sasori', 'Sasori', 'Male', ['Akatsuki', 'Suna'], ['Ninjutsu'], none, ['Earth', 'Water'], ['Missing-nin'], 'Kazekage Rescue Mission', 'Deceased', ['Red Secret Technique', 'Human Puppet'], ['True art is eternal beauty.', 'I turned myself into a puppet.'], 'cold puppet eyes'),
  c('hidan', 'Hidan', 'Male', ['Akatsuki'], ['Taijutsu'], none, none, ['Missing-nin'], 'Akatsuki Suppression Mission', 'Unknown', ['Jashin Ritual', 'Triple-Bladed Scythe'], ['Lord Jashin will punish you.', 'This is my ritual.'], 'wild violet eyes'),
  c('kakuzu', 'Kakuzu', 'Male', ['Akatsuki', 'Taki'], ['Ninjutsu'], none, ['Earth', 'Fire', 'Water', 'Wind', 'Lightning'], ['Missing-nin'], 'Akatsuki Suppression Mission', 'Deceased', ['Earth Grudge Fear', 'Hardening Technique'], ['Money is the only thing you can rely on.', 'A heart is just a tool.'], 'green stitched eyes'),
  c('pain', 'Nagato', 'Male', ['Akatsuki', 'Ame'], ['Ninjutsu'], ['Dojutsu'], ['Fire', 'Wind', 'Lightning', 'Earth', 'Water'], none, "Pain's Assault", 'Deceased', ['Shinra Tensei', 'Chibaku Tensei'], ['This world shall know pain.', 'Peace through pain.'], 'rinnegan ripple eyes'),
  c('konan', 'Konan', 'Female', ['Akatsuki', 'Ame'], ['Ninjutsu'], none, ['Water', 'Wind', 'Earth'], none, "Pain's Assault", 'Deceased', ['Paper Person of God', 'Paper Shuriken'], ['I am the pillar that supports the bridge to peace.', 'Yahiko and Nagato are my hope.'], 'orange shadowed eyes'),
  c('kisame', 'Kisame Hoshigaki', 'Male', ['Akatsuki', 'Kiri'], ['Ninjutsu'], none, ['Water'], ['Missing-nin'], 'Prologue', 'Deceased', ['Water Shark Bomb', 'Samehada Fusion'], ['I am a human with a shark face.', 'A shinobi life is full of lies.'], 'small shark eyes'),
  c('killer-b', 'Killer B', 'Male', ['Kumo'], ['Ninjutsu', 'Taijutsu'], none, ['Lightning'], ['Jinchuriki'], 'Five Kage Summit', 'Alive', ['Lariat', 'Tailed Beast Bomb'], ['Fool ya fool.', 'Rhymes are my way.'], 'hidden sunglass eyes'),
  c('mei', 'Mei Terumi', 'Female', ['Kiri'], ['Ninjutsu'], ['Nature Transformation'], ['Water', 'Fire', 'Earth', 'Lightning'], none, 'Five Kage Summit', 'Alive', ['Lava Release', 'Boil Release'], ['Do not mention marriage.', 'I will melt you.'], 'green elegant eyes'),
  c('onoki', 'Onoki', 'Male', ['Iwa'], ['Ninjutsu'], ['Nature Transformation'], ['Earth', 'Fire', 'Wind', 'Lightning'], none, 'Five Kage Summit', 'Alive', ['Particle Style', 'Light-Weight Rock Technique'], ['A shinobi must never abandon his will.', 'My back may bend but my will does not.'], 'old sharp eyes'),
  c('kaguya', 'Kaguya Otsutsuki', 'Female', ['None'], ['Ninjutsu'], ['Dojutsu'], ['Fire', 'Wind', 'Lightning', 'Earth', 'Water'], none, 'Kaguya Otsutsuki Strikes', 'Deceased', ['All-Killing Ash Bones', 'Expansive Truth-Seeking Ball'], ['All chakra belongs to me.', 'You are my nursery.'], 'pale divine eyes'),
  c('kurama', 'Kurama', 'Other', ['None'], ['Ninjutsu'], none, ['Fire', 'Wind'], ['Tailed Beast'], 'Prologue', 'Alive', ['Tailed Beast Bomb', 'Chakra Roar'], ['You are not the same as the others.', 'Naruto, let us go.'], 'red fox eyes'),
]

function c(
  id: string,
  name: string,
  gender: NarutodleCharacter['gender'],
  affiliations: string[],
  jutsusTypes: string[],
  kekkeiGenkaiTypes: string[],
  natureTypes: string[],
  classifications: string[],
  debut: string,
  status: NarutodleCharacter['status'],
  jutsuClues: string[],
  quoteClues: string[],
  eyeHint: string
): NarutodleCharacter {
  return { id, name, gender, affiliations, jutsusTypes, kekkeiGenkaiTypes, natureTypes, classifications, debut, status, jutsuClues, quoteClues, eyeHint }
}
