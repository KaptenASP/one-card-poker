import { Player, GameState, Action, BotArchetype } from '@/types';
import { calculateEquity } from '../math/equity';

/**
 * Main entry point for deciding a bot's action.
 */
export function getBotAction(player: Player, state: GameState, activeOpponentsCount: number): Action {
  // If no card, just fold (shouldn't happen)
  if (!player.hand || player.hand.length === 0) {
    return { type: 'fold' };
  }

  const myRank = player.hand[0].rank;
  const equity = calculateEquity(myRank, Math.max(0, activeOpponentsCount));
  
  const callAmount = state.highestBet - player.currentBet;
  const potSizeAtCall = state.pot + callAmount;
  const potOdds = callAmount > 0 ? callAmount / (state.pot + callAmount) : 0;
  
  const canCheck = callAmount === 0;

  // Helper to ensure we don't fold if we can check for free
  const safeFold = (): Action => canCheck ? { type: 'call' } : { type: 'fold' };

  switch (player.botArchetype) {
    case 'gto-mathematician': {
      // Calls only if Equity > potOdds
      // Raises if equity is very high
      if (equity > 0.8) {
        return { type: 'raise', amount: state.lastRaiseAmount * 2 };
      }
      if (equity >= potOdds) {
        return { type: 'call' };
      }
      return safeFold();
    }

    case 'nit': {
      // Folds anything lower than a 10
      if (myRank < 10) {
        return safeFold();
      }
      // If very strong, might re-raise
      if (myRank >= 13 && Math.random() > 0.7) {
        return { type: 'raise', amount: state.lastRaiseAmount };
      }
      return { type: 'call' };
    }

    case 'whale': {
      // Calls 90% of the time, rarely raises
      const rand = Math.random();
      if (rand < 0.90) {
        return { type: 'call' };
      } else if (rand < 0.95) {
        return { type: 'raise', amount: state.lastRaiseAmount };
      }
      return safeFold();
    }

    case 'bully': {
      // Bets aggressively whenever they have a Jack (11) or better
      if (myRank >= 11) {
        // Raise by a multiple of the current raise
        return { type: 'raise', amount: state.lastRaiseAmount * 2 };
      }
      if (equity >= potOdds) {
        return { type: 'call' };
      }
      return safeFold();
    }

    case 'gambler': {
      // Randomly bluffs with low cards (2 - 5)
      if (myRank >= 2 && myRank <= 5) {
        if (Math.random() > 0.6) {
          return { type: 'raise', amount: state.lastRaiseAmount * 3 };
        }
      }
      if (Math.random() > 0.5 || canCheck) {
        return { type: 'call' };
      }
      return safeFold();
    }

    case 'pot-committed': {
      if (player.totalInvested >= 10) { // adjusted for higher betting
        return { type: 'call' };
      }
      if (equity >= potOdds) {
        return { type: 'call' };
      }
      return safeFold();
    }

    default:
      if (equity >= potOdds) {
        return { type: 'call' };
      }
      return safeFold();
  }
}
