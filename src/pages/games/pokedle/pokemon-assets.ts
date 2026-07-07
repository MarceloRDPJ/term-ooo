// src/pages/games/pokedle/pokemon-assets.ts

import type { PokedlePokemon } from './types'

export function getPokemonArtworkUrl(pokemon: PokedlePokemon | number): string {
  const id = typeof pokemon === 'number' ? pokemon : pokemon.id
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function getPokemonSpriteUrl(pokemon: PokedlePokemon | number): string {
  const id = typeof pokemon === 'number' ? pokemon : pokemon.id
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export function getPokemonInitials(pokemon: Pick<PokedlePokemon, 'name'> | string): string {
  const name = typeof pokemon === 'string' ? pokemon : pokemon.name
  return name.slice(0, 2).toUpperCase()
}
