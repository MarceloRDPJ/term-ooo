# PITACO Cruzado

Quatro palavras secretas de 5 letras sao sorteadas a cada dia. O jogador
digita UM palpite por turno e esse palpite vai para os 4 tabuleiros ao
mesmo tempo; cada board colore os tiles de forma independente (ciano =
letra certa na posicao certa, amarelo = letra presente em outra posicao,
cinza = letra ausente). Vence quem acertar as 4 palavras em ate 9
tentativas. Inspirado em Quordle.

## Regras

- 4 boards de 5 colunas x 9 linhas, dispostos 2x2 (mobile) ou 4x1 (desktop).
- 1 teclado compartilhado (cada tecla mostra o gradiente conic com o estado por board).
- Palavra invalida = erro + shake da linha. Palavra incompleta = erro.
- Vence quando todos os 4 boards estao completos. Perde se nao completou ate a 9a tentativa.
- Save por dia em `localStorage` na chave `pitaco:crossword:state:${dateKey}`.
- Botao "reabrir" limpa o save do dia e recarrega a pagina (volta ao estado virgem).
- As 4 palavras vem de `getCrosswordWords(dayNumber)` com offset proprio (+137) para nao coincidir com as do modo Quarteto no mesmo dia.
