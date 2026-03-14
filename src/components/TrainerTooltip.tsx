"use client";

import React from 'react';
import { useGameStore } from '@/lib/game/store';
import { calculateEquity } from '@/lib/math/equity';

export function TrainerTooltip() {
  const state = useGameStore(s => s.state);
  const { setRevealed } = useGameStore();
  
  const currentPlayer = state.players[state.currentTurn];
  
  if (state.stage !== 'preflop' || currentPlayer?.botArchetype !== 'user' || !currentPlayer.isActive) {
    return null;
  }

  const activeOpponentsCount = state.players.filter(p => p.isActive && p.id !== currentPlayer.id).length;
  const myRank = currentPlayer.hand.length > 0 ? currentPlayer.hand[0].rank : null;
  
  if (!myRank) return null;

  const equity = calculateEquity(myRank, activeOpponentsCount);
  const callAmount = state.highestBet - currentPlayer.currentBet;
  const potSizeAtCall = state.pot + callAmount;
  const potOdds = callAmount > 0 ? callAmount / potSizeAtCall : 0;
  
  const isEvPlus = equity >= potOdds;
  const breakEvenPct = (potOdds * 100).toFixed(1);
  const equityPct = (equity * 100).toFixed(1);

  let rec = '';
  if (callAmount === 0) {
    rec = equity > 0.6 ? 'Raise' : 'Check';
  } else {
    rec = equity > 0.7 ? 'Raise' : isEvPlus ? 'Call' : 'Fold';
  }

  if (!state.isRevealed) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <button 
          onClick={() => setRevealed(true)}
          className="h-9 sm:h-10 px-3 sm:px-4 bg-[#111111] hover:bg-[#191919] text-[#737373] hover:text-[#e5e5e5] text-[12px] sm:text-[13px] font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all flex items-center gap-2"
        >
          <span className="text-sm sm:text-base">🧠</span>
          <span>Reveal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 sm:w-[320px] bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-[#1a1a1a]">
        <span className="text-[12px] sm:text-[13px] font-medium text-[#e5e5e5]">Trainer</span>
        <button 
          onClick={() => setRevealed(false)}
          className="text-[11px] text-[#525252] hover:text-[#e5e5e5] transition-colors"
        >
          Hide
        </button>
      </div>

      {/* Recommendation */}
      <div className={`px-4 py-2.5 sm:py-3 border-b border-[#1a1a1a] ${isEvPlus ? 'bg-[#10b981]/5' : 'bg-red-500/5'}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] text-[#525252] uppercase tracking-wider font-medium">Action</span>
          <span className={`text-[12px] sm:text-[13px] font-semibold ${isEvPlus ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {rec}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2.5 sm:py-3 space-y-2 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-[12px] text-[#525252]">Break-even</span>
          <span className="text-[11px] sm:text-[12px] font-mono text-[#a3a3a3]">{breakEvenPct}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-[12px] text-[#525252]">Your equity</span>
          <span className={`text-[11px] sm:text-[12px] font-mono font-medium ${isEvPlus ? 'text-[#10b981]' : 'text-[#a3a3a3]'}`}>
            {equityPct}%
          </span>
        </div>
      </div>

      {/* Math */}
      <div className="px-4 py-2.5 sm:py-3 space-y-2">
        <span className="text-[9px] sm:text-[10px] text-[#404040] uppercase tracking-wider font-medium">Math</span>
        <div className="space-y-1 sm:space-y-1.5 mt-1">
          <div className="text-[10px] sm:text-[11px] font-mono text-[#525252] break-all">
            <span className="text-[#737373]">pot_odds</span> = {callAmount}/({state.pot}+{callAmount}) = <span className="text-[#a3a3a3]">{potOdds.toFixed(4)}</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-[#525252] break-all">
            <span className="text-[#737373]">equity</span>(n={activeOpponentsCount}) = <span className="text-[#a3a3a3]">{equity.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
