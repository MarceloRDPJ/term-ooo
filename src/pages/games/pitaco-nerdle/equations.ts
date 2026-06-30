// src/pages/games/pitaco-nerdle/equations.ts
//
// Pool de equacoes validas para o PITACO Nerdle.
// Cada equacao tem exatamente 8 caracteres no formato AA<op>BB=CC,
// onde AA, BB, CC sao numeros de 2 digitos (10-99) sem zeros a esquerda.
// Operadores suportados: + e -.
// (Para o espaco 8-char, multiplicacao/divisao com operandos 2-digit
// raramente cabem; mantemos + e - no pool por consistencia.)

export const NERDLE_EQUATIONS: readonly string[] = [
  '12+34=46',
  '15+23=38',
  '45+32=77',
  '20+13=33',
  '50+25=75',
  '11+22=33',
  '13+24=37',
  '34+15=49',
  '23+45=68',
  '41+22=63',
  '31+28=59',
  '17+42=59',
  '24+35=59',
  '33+44=77',
  '51+27=78',
  '98-27=71',
  '87-32=55',
  '65-23=42',
  '75-44=31',
  '99-47=52',
  '84-21=63',
  '76-34=42',
  '58-26=32',
  '97-53=44',
  '69-37=32',
  '54-12=42',
  '88-46=42',
  '46+52=98',
  '22+66=88',
  '93-51=42',
]
