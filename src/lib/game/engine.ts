import { useEffect } from 'react';
import { useGameStore } from './store';
import { getBotAction } from '../bots';

export function useGameLoop() {
  const state = useGameStore((s) => s.state);
  const applyAction = useGameStore((s) => s.applyAction);
  const advanceTurn = useGameStore((s) => s.advanceTurn);
  const resolveShowdown = useGameStore((s) => s.resolveShowdown);

  useEffect(() => {
    if (state.stage !== 'preflop') return;

    const activePlayers = state.players.filter((p) => p.isActive);

    // If only one player left, they win immediately
    if (activePlayers.length <= 1) {
      resolveShowdown();
      return;
    }

    // Check if betting round is over
    const roundOver = activePlayers.every(
      (p) => p.hasActed && (p.currentBet === state.highestBet || p.chips === 0)
    );

    if (roundOver) {
      resolveShowdown();
      return;
    }

    const currentPlayer = state.players[state.currentTurn];

    // Wait for User input
    if (currentPlayer.botArchetype === 'user') {
      return;
    }

    // Bot decision with artificial delay
    const timer = setTimeout(() => {
      // Calculate how many opponents THIS bot faces
      const activeCount = activePlayers.length - 1;
      const action = getBotAction(currentPlayer, state, activeCount);

      applyAction(action.type, action.amount);
      
      // We don't call advanceTurn here, because applyAction updates the state.
      // Wait, we need to advance the turn manually or inside applyAction.
      // applyAction only logs the action and updates chips/bets. It DOES NOT increment `currentTurn`.
      // So we DO need to call advanceTurn!
      advanceTurn();
    }, 200);

    return () => clearTimeout(timer);
  }, [state, applyAction, advanceTurn, resolveShowdown]);
}
