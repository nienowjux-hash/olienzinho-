'use strict';
// ---------- historia: prologo, missoes, falas de vitoria e epilogo ----------
// who: N = narrador, O = Olienzinho, B = Orbi (o copiloto). mood: 'happy' | 'hurt' | undefined
const CHARS = {
  O: { name: 'OLIENZINHO', c: '#b98cff' },
  B: { name: 'ORBI', c: '#7fe0ff' },
  N: { name: '', c: '#e2d4ff' },
};

const STORY = {
  prologue: [
    { who: 'N', text: 'No começo, todas as estrelas nasceram de um único Coração de Luz.' },
    { who: 'N', text: 'Até que o Vazio despertou... e começou a apagar o céu, uma estrela por vez.' },
    { who: 'N', text: 'Seus soldados, os Zangões, tomaram os setores mais próximos. Um a um, os guardiões da luz foram caindo.' },
    { who: 'N', text: 'Restou o menor deles: um foguete de um olho só, com coragem do tamanho de uma galáxia.' },
    { who: 'B', text: 'Olienzinho, os sensores confirmam: três estrelas se apagaram só hoje.' },
    { who: 'O', text: 'Então a gente acende todas de volta. Uma por uma!' },
    { who: 'B', text: 'Sistema pronto. Combustível: esperança. Decolagem autorizada!' },
    { who: 'O', mood: 'happy', text: 'Olienzinho, decolando!' },
  ],
  stages: [
    {
      intro: [
        { who: 'B', text: 'Setor um: Nebulosa Violeta. Os Zangões ergueram uma Nave-Mãe aqui e estão sugando toda a luz da nebulosa.' },
        { who: 'O', text: 'Se a mãe cair, o enxame inteiro cai junto. Vamos lá!' },
        { mission: { n: 1, title: 'Acender a Nebulosa', goal: 'Sobreviva ao enxame e derrote a Nave-Mãe Zangão.', boss: 'Nave-Mãe Zangão' } },
      ],
      victory: 'Seu enxame acabou, zangão. A nebulosa vai brilhar de novo!',
    },
    {
      intro: [
        { who: 'B', text: 'Setor dois: Cinturão de Asteroides. O Vazio acordou um Gigante de Rocha para bloquear a passagem. Há minas espalhadas por toda parte.' },
        { who: 'O', text: 'Pedra não assusta quem tem luz. Segura firme, Orbi!' },
        { mission: { n: 2, title: 'Atravessar o Cinturão', goal: 'Desvie das minas e dos asteroides e derrote o Gigante de Rocha.', boss: 'Gigante de Rocha' } },
      ],
      victory: 'Pedra dura, coração duro... mas a minha luz atravessa tudo!',
    },
    {
      intro: [
        { who: 'B', text: 'Setor três: Tempestade Iônica. Raios caem sem aviso, e uma criatura observa tudo do centro da tormenta: o Olho da Tempestade.' },
        { who: 'O', text: 'Ele vê tudo, é? Então vai me ver chegando de frente.' },
        { who: 'B', text: 'Dica: cada raio aparece marcado no chão antes de cair. Olhe sempre o aviso!' },
        { mission: { n: 3, title: 'Atravessar a Tempestade', goal: 'Fuja dos raios e derrote o Olho da Tempestade.', boss: 'Olho da Tempestade' } },
      ],
      victory: 'Você via tudo, menos uma coisa: eu não tenho medo do escuro!',
    },
    {
      intro: [
        { who: 'B', text: 'Setor quatro: Zona Solar. O Vazio prendeu uma estrela viva dentro de uma armadura: o Sol-Guardião.' },
        { who: 'O', text: 'Ele não é o inimigo. É só mais uma estrela que apagaram por dentro. Eu vou acordar ele.' },
        { who: 'B', text: 'A temperatura vai subir bastante. Escudo térmico a postos!' },
        { mission: { n: 4, title: 'Libertar o Sol', goal: 'Resista às erupções e derrote o Sol-Guardião.', boss: 'Sol-Guardião' } },
      ],
      victory: 'Acorda, amigão. Brilhar é o que você faz de melhor!',
    },
  ],
  epilogue: [
    { who: 'N', text: 'A armadura se partiu. A estrela livre brilhou, e a luz correu por todo o céu.' },
    { who: 'N', text: 'Nebulosas, asteroides, tempestades... tudo voltou a se acender, uma estrela por vez.' },
    { who: 'B', text: 'Olienzinho, os sensores mostram milhares de estrelas acesas!' },
    { who: 'O', mood: 'happy', text: 'Missão cumprida! Mas o Vazio ainda está lá fora...' },
    { who: 'N', text: 'E o pequeno guardião de um olho só seguiu voando. Fim da Parte 1.' },
  ],
};
