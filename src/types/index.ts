export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; 
// 11=J, 12=Q, 13=K, 14=A

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type BotArchetype = 
  | 'user'
  | 'gto-mathematician'
  | 'nit'
  | 'whale'
  | 'bully'
  | 'gambler'
  | 'pot-committed';

export type ActionType = 'fold' | 'call' | 'raise';

export interface Action {
  type: ActionType;
  amount?: number;
}

export interface Player {
  id: string;
  name: string;
  seatIndex: number;
  chips: number;
  botArchetype: BotArchetype;
  hand: Card[]; // length is always 1 for this game
  currentBet: number;
  isActive: boolean; // false if folded
  hasActed: boolean;
  totalInvested: number; // useful for pot-committed bot
}

export type GameStage = 'preflop' | 'showdown' | 'complete';

export interface GameState {
  pot: number;
  players: Player[];
  currentTurn: number; // seatIndex of the next player to act
  stage: GameStage;
  highestBet: number;
  deck: Card[];
  winners: Player[]; // populated at showdown
  actionLog: string[];
  isRevealed: boolean;
  lastRaiseAmount: number;
}
