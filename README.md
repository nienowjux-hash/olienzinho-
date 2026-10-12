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
| R | arma secundária (escolhida no hangar) |
| Tab | trocar de piloto durante a fase (guardiões libertos) |
| N | ligar/desligar Novo Jogo+ (nos menus) |
| Esc / P | pausar |
| C | alternar 1 / 2 jogadores (nos menus) |
| Setas + Enter / . | P2 no cooperativo: mover, especial, esquiva |
| F9 / F8 | foto com moldura / esconder interface |
| Controle | funciona: analógico/direcional, A pulso, X especial, RB esquiva, Start pausa |
| Enter / clique | avançar nas cenas |

## O que tem

- 10 fases (Partes 1, 2, 3 e o Ato Final "O Último Céu", com o Coração do Outro Lado em três atos e o Epílogo contra o seu próprio reflexo; Parte 3: Cidade de Luz, Oceano de Estrelas e Espelho do Céu, com inimigos, tiros e ataques de chefe próprios) e com bioma, música e eventos próprios, cada uma com minichefe e um chefe de 3 fases de fúria, até o Vazio.
- Armas, pilotos guardiões (Colmeia, Pétreo, Vigia, Solaris), armas secundárias, chefes secretos, aventuras, arena semanal, prática de chefes, recordes por fase, dificuldade Pesadelo, 6 skins, esquiva, especiais, Orbi jogável, Modo Infinito, Desafio do Dia, Modo Treino, conquistas e fragmentos escondidos.
- RPG: upgrades ao subir de nível, loja permanente, progresso salvo no navegador.
- 7 cutscenes em vídeo nos momentos-chave (prólogo, abertura do Ato II, o Vazio desperta, fim da Parte 2, abertura da Parte 3, abertura do Ato Final e final; versões 720p automáticas para PCs fracos), com opção para desligar em Opções (VÍDEOS). Os arquivos ficam em `web/video` e são gerados pelo `web/js/cine.js`.
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

- `stage=N` começa direto na fase N (0 a 5)
- `boss=1` vai direto para o chefe
- `god=1` vida enorme
- `rich=1` muitas estrelas na loja
- `story=1` mostra a história (sem isso ela é pulada nos testes)
