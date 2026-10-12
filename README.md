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
| F | rebater tiros inimigos próximos (recarga curta) |
| Tab | trocar de piloto durante a fase (guardiões libertos) |
| N | ligar/desligar Novo Jogo+ (nos menus) |
| Esc / P | pausar |
| C | alternar 1 / 2 jogadores (nos menus) |
| Setas + Enter / . | P2 no cooperativo: mover, especial, esquiva |
| F9 / F8 | foto com moldura / esconder interface |
| Controle | funciona: analógico/direcional, A pulso, X especial, RB esquiva, Start pausa |
| Enter / clique | avançar nas cenas |

## Testes automáticos

Abra `web/index.html?selftest=1` (por um servidor local): o jogo roda o bot nas 10 fases, renderiza todas as telas e mostra um relatório com erros de script. Tudo é feito sem alterar o seu save.

## O que tem

- 10 fases (Partes 1, 2, 3 e o Ato Final "O Último Céu", com o Coração do Outro Lado em três atos e o Epílogo contra o seu próprio reflexo; Parte 3: Cidade de Luz, Oceano de Estrelas e Espelho do Céu, com inimigos, tiros e ataques de chefe próprios) e com bioma, música e eventos próprios, cada uma com minichefe e um chefe de 3 fases de fúria, até o Vazio.
- Armas, pilotos guardiões (Colmeia, Pétreo, Vigia, Solaris), armas secundárias, chefes secretos, aventuras, arena semanal, prática de chefes, recordes por fase, dificuldade Pesadelo, 6 skins, esquiva, especiais, Orbi jogável, Modo Infinito, Desafio do Dia, Modo Treino, conquistas e fragmentos escondidos.
- Mutadores, árvore de talentos permanente, estatísticas, galeria de vídeos, exportar/importar o save, teclas configuráveis, filtros de cor e vibração do controle, dificuldade LIVRE e final verdadeiro (6 fragmentos).
- Novidades: Modo Expedição (rota roguelite com batalhas, elites, lojas, eventos e chefes), fusão de armas, companheiros dos guardiões, cooperativo com escolha de piloto e reviver, metas dentro das fases, inimigo Caçador, dificuldade AUTO adaptativa, semente compartilhável, perfis de save, cosméticos, modo foto com filtros e molduras.
- Publicação grátis: o repositório publica a pasta `web/` no GitHub Pages (Settings → Pages → Source: GitHub Actions) e o jogo pode ser instalado como app (PWA).
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
