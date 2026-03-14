import { create } from 'zustand';
import { GameState, Player, Card, ActionType } from '@/types';

// Helper to create a shuffled deck of 52 cards
function createDeck(): Card[] {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let r = 2; r <= 14; r++) {
      deck.push({ rank: r as any, suit });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 'user', name: 'You', seatIndex: 0, chips: 100, botArchetype: 'user', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
  { id: 'bot1', name: 'GTO Pro', seatIndex: 1, chips: 100, botArchetype: 'gto-mathematician', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
  { id: 'bot2', name: 'Mr. Nit', seatIndex: 2, chips: 100, botArchetype: 'nit', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
  { id: 'bot3', name: 'The Whale', seatIndex: 3, chips: 100, botArchetype: 'whale', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
  { id: 'bot4', name: 'Bully', seatIndex: 4, chips: 100, botArchetype: 'bully', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
  { id: 'bot5', name: 'Sticky', seatIndex: 5, chips: 100, botArchetype: 'pot-committed', hand: [], currentBet: 0, isActive: true, hasActed: false, totalInvested: 0 },
];

interface GameStore {
  state: GameState;
  dealerIndex: number;
  startHand: () => void;
  applyAction: (actionType: ActionType, amount?: number) => void;
  advanceTurn: () => void;
  resolveShowdown: () => void;
  setRevealed: (revealed: boolean) => void;
}

const initialState: GameState = {
  pot: 0,
  players: INITIAL_PLAYERS,
  currentTurn: 0,
  stage: 'complete',
  highestBet: 0,
  deck: [],
  winners: [],
  actionLog: [],
  isRevealed: false,
  lastRaiseAmount: 2
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState,
  dealerIndex: 0,

  startHand: () => set((store) => {
    const deck = createDeck();
    let dIndex = store.state.stage === 'complete' && store.state.players.some(p => p.hand.length > 0) 
      ? (store.dealerIndex + 1) % 6 
      : store.dealerIndex;

    const sbIndex = (dIndex + 1) % 6;
    const bbIndex = (dIndex + 2) % 6;
    let firstActor = (dIndex + 3) % 6;

    // Deal cards and reset per-hand state
    const newPlayers = store.state.players.map(p => ({
      ...p,
      hand: [deck.pop()!],
      currentBet: 0,
      isActive: p.chips > 0,
      hasActed: false,
      totalInvested: 0,
    }));

    // Post blinds
    let pot = 0;
    
    if (newPlayers[sbIndex].isActive) {
      const sbAmount = Math.min(1, newPlayers[sbIndex].chips);
      newPlayers[sbIndex].currentBet = sbAmount;
      newPlayers[sbIndex].chips -= sbAmount;
      newPlayers[sbIndex].totalInvested += sbAmount;
      pot += sbAmount;
    }

    let highestBet = 0;
    if (newPlayers[bbIndex].isActive) {
      const bbAmount = Math.min(2, newPlayers[bbIndex].chips);
      newPlayers[bbIndex].currentBet = bbAmount;
      newPlayers[bbIndex].chips -= bbAmount;
      newPlayers[bbIndex].totalInvested += bbAmount;
      pot += bbAmount;
      highestBet = 2;
    } else {
      highestBet = 1;
    }

    // Ensure we start on an active player with chips
    let attempts = 0;
    while ((!newPlayers[firstActor].isActive || newPlayers[firstActor].chips === 0) && attempts < 6) {
      firstActor = (firstActor + 1) % 6;
      attempts++;
    }

    return {
      dealerIndex: dIndex,
      state: {
        pot,
        players: newPlayers,
        currentTurn: firstActor,
        stage: 'preflop',
        highestBet,
        deck,
        winners: [],
        actionLog: ['New hand started. Blinds posted.'],
        isRevealed: false,
        lastRaiseAmount: 2
      }
    };
  }),

  applyAction: (actionType, amount) => set((store) => {
    const s = store.state;
    if (s.stage !== 'preflop') return store;

    const newPlayers = s.players.map(p => ({ ...p })); // deep copy
    const player = newPlayers[s.currentTurn];
    
    let addedToPot = 0;
    let newHighestBet = s.highestBet;
    let newLastRaise = s.lastRaiseAmount;
    let actionStr = `${player.name} `;

    if (actionType === 'fold') {
      player.isActive = false;
      actionStr += `folded.`;
    } else if (actionType === 'call') {
      const callAmount = s.highestBet - player.currentBet;
      const actualCall = Math.min(callAmount, player.chips);
      player.currentBet += actualCall;
      player.chips -= actualCall;
      player.totalInvested += actualCall;
      addedToPot += actualCall;
      actionStr += actualCall === 0 ? `checked.` : `called ${actualCall}.`;
    } else if (actionType === 'raise') {
      const raiseAdd = amount || s.lastRaiseAmount;
      const targetBet = s.highestBet + raiseAdd;
      const needed = targetBet - player.currentBet;
      const actualInvest = Math.min(needed, player.chips);
      
      player.currentBet += actualInvest;
      player.chips -= actualInvest;
      player.totalInvested += actualInvest;
      addedToPot += actualInvest;
      
      const prevHighest = s.highestBet;
      newHighestBet = Math.max(newHighestBet, player.currentBet);
      
      const actualRaise = newHighestBet - prevHighest;
      if (actualRaise > 0) {
        newLastRaise = actualRaise;
      }

      actionStr += player.chips === 0 ? `went all-in for ${actualInvest}.` : `raised by ${actualRaise}.`;

      // Reset hasActed for everyone else because of the raise
      newPlayers.forEach((p, idx) => {
        if (p.isActive && idx !== s.currentTurn) {
          p.hasActed = false;
        }
      });
    }

    // ALWAYS mark the acting player as having acted
    player.hasActed = true;

    return {
      state: {
        ...s,
        players: newPlayers,
        pot: s.pot + addedToPot,
        highestBet: newHighestBet,
        lastRaiseAmount: newLastRaise,
        actionLog: [...s.actionLog, actionStr]
      }
    };
  }),

  advanceTurn: () => set((store) => {
    const s = store.state;
    if (s.stage !== 'preflop') return store;

    // Simply find the next player who is active AND has chips left AND
    // either hasn't acted yet or hasn't matched the highest bet.
    // If no such player exists, the engine useEffect will detect round-over.
    
    let nextTurn = (s.currentTurn + 1) % 6;
    let attempts = 0;
    
    while (attempts < 6) {
      const p = s.players[nextTurn];
      // Skip: not active, or all-in with matched bet
      if (p.isActive && !(p.chips === 0 && p.hasActed)) {
        break;
      }
      nextTurn = (nextTurn + 1) % 6;
      attempts++;
    }

    return {
      state: { ...s, currentTurn: nextTurn }
    };
  }),

  resolveShowdown: () => set((store) => {
    const s = store.state;
    const activePlayers = s.players.filter(p => p.isActive);
    
    let winners: Player[] = [];
    
    if (activePlayers.length === 1) {
      winners = [activePlayers[0]];
    } else {
      let highestRank = -1;
      activePlayers.forEach(p => {
        if (p.hand[0].rank > highestRank) {
          highestRank = p.hand[0].rank;
        }
      });
      winners = activePlayers.filter(p => p.hand[0].rank === highestRank);
    }

    // Split pot
    const splitAmount = Math.floor(s.pot / winners.length);
    const newPlayers = s.players.map(p => ({ ...p }));
    winners.forEach(w => {
      const idx = newPlayers.findIndex(p => p.id === w.id);
      newPlayers[idx].chips += splitAmount;
    });

    const remainder = s.pot % winners.length;
    if (remainder > 0 && winners.length > 0) {
      const idx = newPlayers.findIndex(p => p.id === winners[0].id);
      newPlayers[idx].chips += remainder;
    }

    const winnerNames = winners.map(w => w.name).join(', ');
    
    return {
      state: {
        ...s,
        players: newPlayers,
        stage: 'complete',
        winners,
        actionLog: [...s.actionLog, `Showdown! ${winnerNames} win(s) the pot of ${s.pot}.`]
      }
    };
  }),

  setRevealed: (revealed: boolean) => set((store) => ({
    state: { ...store.state, isRevealed: revealed }
  }))

}));
