// src/pages/games/pokedle/pokemon.ts

import type { PokedlePokemon } from './types'

export const POKEMON: PokedlePokemon[] = [
  p(1, 'bulbasaur', 'Bulbasaur', ['Grass', 'Poison'], 1, 'Green', 'Grassland', 'Quadruped', 'Base'),
  p(2, 'ivysaur', 'Ivysaur', ['Grass', 'Poison'], 1, 'Green', 'Grassland', 'Quadruped', 'Middle'),
  p(3, 'venusaur', 'Venusaur', ['Grass', 'Poison'], 1, 'Green', 'Grassland', 'Quadruped', 'Final'),
  p(4, 'charmander', 'Charmander', ['Fire'], 1, 'Red', 'Mountain', 'Upright', 'Base'),
  p(5, 'charmeleon', 'Charmeleon', ['Fire'], 1, 'Red', 'Mountain', 'Upright', 'Middle'),
  p(6, 'charizard', 'Charizard', ['Fire', 'Flying'], 1, 'Red', 'Mountain', 'Winged', 'Final'),
  p(7, 'squirtle', 'Squirtle', ['Water'], 1, 'Blue', 'Waters-edge', 'Upright', 'Base'),
  p(8, 'wartortle', 'Wartortle', ['Water'], 1, 'Blue', 'Waters-edge', 'Upright', 'Middle'),
  p(9, 'blastoise', 'Blastoise', ['Water'], 1, 'Blue', 'Waters-edge', 'Upright', 'Final'),
  p(25, 'pikachu', 'Pikachu', ['Electric'], 1, 'Yellow', 'Forest', 'Quadruped', 'Middle'),
  p(39, 'jigglypuff', 'Jigglypuff', ['Normal', 'Fairy'], 1, 'Pink', 'Grassland', 'Humanoid', 'Middle'),
  p(52, 'meowth', 'Meowth', ['Normal'], 1, 'Yellow', 'Urban', 'Quadruped', 'Base'),
  p(54, 'psyduck', 'Psyduck', ['Water'], 1, 'Yellow', 'Waters-edge', 'Upright', 'Base'),
  p(58, 'growlithe', 'Growlithe', ['Fire'], 1, 'Brown', 'Grassland', 'Quadruped', 'Base'),
  p(63, 'abra', 'Abra', ['Psychic'], 1, 'Brown', 'Urban', 'Upright', 'Base'),
  p(66, 'machop', 'Machop', ['Fighting'], 1, 'Gray', 'Mountain', 'Humanoid', 'Base'),
  p(92, 'gastly', 'Gastly', ['Ghost', 'Poison'], 1, 'Purple', 'Cave', 'Head', 'Base'),
  p(95, 'onix', 'Onix', ['Rock', 'Ground'], 1, 'Gray', 'Cave', 'Serpentine', 'Base'),
  p(129, 'magikarp', 'Magikarp', ['Water'], 1, 'Red', 'Waters-edge', 'Fish', 'Base'),
  p(130, 'gyarados', 'Gyarados', ['Water', 'Flying'], 1, 'Blue', 'Waters-edge', 'Serpentine', 'Final'),
  p(133, 'eevee', 'Eevee', ['Normal'], 1, 'Brown', 'Urban', 'Quadruped', 'Base'),
  p(143, 'snorlax', 'Snorlax', ['Normal'], 1, 'Black', 'Mountain', 'Upright', 'Final'),
  p(150, 'mewtwo', 'Mewtwo', ['Psychic'], 1, 'Purple', 'Cave', 'Humanoid', 'Single'),
  p(151, 'mew', 'Mew', ['Psychic'], 1, 'Pink', 'Rare', 'Upright', 'Single'),
  p(152, 'chikorita', 'Chikorita', ['Grass'], 2, 'Green', 'Grassland', 'Quadruped', 'Base'),
  p(155, 'cyndaquil', 'Cyndaquil', ['Fire'], 2, 'Yellow', 'Grassland', 'Quadruped', 'Base'),
  p(158, 'totodile', 'Totodile', ['Water'], 2, 'Blue', 'Waters-edge', 'Upright', 'Base'),
  p(172, 'pichu', 'Pichu', ['Electric'], 2, 'Yellow', 'Forest', 'Quadruped', 'Baby'),
  p(196, 'espeon', 'Espeon', ['Psychic'], 2, 'Purple', 'Urban', 'Quadruped', 'Final'),
  p(197, 'umbreon', 'Umbreon', ['Dark'], 2, 'Black', 'Urban', 'Quadruped', 'Final'),
  p(252, 'treecko', 'Treecko', ['Grass'], 3, 'Green', 'Forest', 'Upright', 'Base'),
  p(255, 'torchic', 'Torchic', ['Fire'], 3, 'Red', 'Grassland', 'Legs', 'Base'),
  p(258, 'mudkip', 'Mudkip', ['Water'], 3, 'Blue', 'Waters-edge', 'Quadruped', 'Base'),
  p(280, 'ralts', 'Ralts', ['Psychic', 'Fairy'], 3, 'White', 'Urban', 'Humanoid', 'Base'),
  p(359, 'absol', 'Absol', ['Dark'], 3, 'White', 'Mountain', 'Quadruped', 'Single'),
  p(393, 'piplup', 'Piplup', ['Water'], 4, 'Blue', 'Waters-edge', 'Humanoid', 'Base'),
  p(447, 'riolu', 'Riolu', ['Fighting'], 4, 'Blue', 'Mountain', 'Upright', 'Base'),
  p(448, 'lucario', 'Lucario', ['Fighting', 'Steel'], 4, 'Blue', 'Mountain', 'Upright', 'Final'),
  p(495, 'snivy', 'Snivy', ['Grass'], 5, 'Green', 'Grassland', 'Serpentine', 'Base'),
  p(498, 'tepig', 'Tepig', ['Fire'], 5, 'Red', 'Grassland', 'Quadruped', 'Base'),
  p(501, 'oshawott', 'Oshawott', ['Water'], 5, 'Blue', 'Waters-edge', 'Upright', 'Base'),
  p(656, 'froakie', 'Froakie', ['Water'], 6, 'Blue', 'Waters-edge', 'Upright', 'Base'),
  p(722, 'rowlet', 'Rowlet', ['Grass', 'Flying'], 7, 'Brown', 'Forest', 'Winged', 'Base'),
  p(725, 'litten', 'Litten', ['Fire'], 7, 'Red', 'Grassland', 'Quadruped', 'Base'),
  p(728, 'popplio', 'Popplio', ['Water'], 7, 'Blue', 'Sea', 'Flippers', 'Base'),
  p(813, 'scorbunny', 'Scorbunny', ['Fire'], 8, 'White', 'Grassland', 'Upright', 'Base'),
  p(816, 'sobble', 'Sobble', ['Water'], 8, 'Blue', 'Waters-edge', 'Upright', 'Base'),
  p(906, 'sprigatito', 'Sprigatito', ['Grass'], 9, 'Green', 'Grassland', 'Quadruped', 'Base'),
  p(909, 'fuecoco', 'Fuecoco', ['Fire'], 9, 'Red', 'Grassland', 'Upright', 'Base'),
  p(912, 'quaxly', 'Quaxly', ['Water'], 9, 'Blue', 'Waters-edge', 'Winged', 'Base'),
]

export function findPokemonById(id: number): PokedlePokemon | undefined {
  return POKEMON.find((pokemon) => pokemon.id === id)
}

function p(
  id: number,
  slug: string,
  name: string,
  types: string[],
  generation: number,
  color: string,
  habitat: string,
  shape: string,
  evolutionStage: PokedlePokemon['evolutionStage']
): PokedlePokemon {
  return { id, slug, name, types, generation, color, habitat, shape, evolutionStage }
}
