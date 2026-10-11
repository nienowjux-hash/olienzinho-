# Olienzinho: Guardião das Estrelas

Um RPG de nave (shoot'em up) em que o Olienzinho, o menor foguete da galáxia, tenta acender de volta as estrelas que o Vazio apagou.
Parte 1: **O Coração Partido**.

## Como jogar

Abra o arquivo `web/index.html` no navegador (Chrome ou Edge). Não precisa instalar nada.

| Tecla | Ação |
|---|---|
| WASD / setas / mouse | mover |
| (automático) | atirar |
| Espaço | Pulso Olien (limpa a tela) |
| Shift | Esquiva (dash, invulnerável por um instante) |
| Q / E | Habilidade especial da arma equipada |
| Esc / P | pausar |
| Enter / clique | avançar nas cenas |

## O que tem

- 4 fases com bioma, música e eventos próprios, cada uma com um chefe de 3 fases de fúria.
- RPG: upgrades ao subir de nível, loja permanente, progresso salvo no navegador.
- História com cenas animadas, retratos dos personagens e música para cada emoção.
- Áudio 100% sintetizado por código (Web Audio), sem arquivos de som.

## Estrutura

```
web/            o jogo (HTML + JavaScript puro)
  index.html
  js/           util, audio, art, world, stages, entities, events, boss,
                portraits, story, game, ui, screens, main
  demo.html     demo visual antiga
Assets/ ...     projeto Unity 2D (parado; o jogo atual é a versão web)
```

## Testes rápidos (parâmetros na URL)

`web/index.html?stage=1&boss=1&god=1&rich=1&story=1`

- `stage=N` começa direto na fase N (0 a 3)
- `boss=1` vai direto para o chefe
- `god=1` vida enorme
- `rich=1` muitas estrelas na loja
- `story=1` mostra a história (sem isso ela é pulada nos testes)
