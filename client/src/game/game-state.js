export const PHASES = [
  "waiting",
  "preflop",
  "flop",
  "turn",
  "river",
  "showdown",
];

export const state = {
  phase: "waiting",
  handNumber: 0,

  smallBlind: 10,
  bigBlind: 20,

  deck: [],
  communityCards: [], //0 - 5 cards, visible to all

  pot: 0,
  sidePots: [], //[{ amount, eligiblePlayers: [i,...] }]
  currentBet: 0, //the bet players must match
  minRaise: 20,

  dealerIndex: 0,
  bigBlindIndex: 0, //tracked for big blind preflop option (if no one else has raised)
  activeIndex: 0, //whose turn it is

  actionHistory: [], //{ playerIndex, type, amount } for the UI
  actedThisRound: [], //[playerIndex, playerIndex, etc]
  bigBlindActed: false, //whether big blind has acted

  players: [
    {
      id: "abc",
      name: "Host",
      chips: 500,
      bet: 0, //amount bet this turn
      totalBet: 0, //amount bet this hand
      holeCards: [2, 7], //server-side
      folded: false,
      allIn: false,
      isBot: false,
      connected: true,
    },
  ],
  winners: null, //set during showdown: [{ playerIndex, amount, handName }]
  lastAction: null, //{ playerIndex, type, amount } for the UI
};
