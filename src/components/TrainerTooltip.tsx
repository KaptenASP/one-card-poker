"use client";

import React from 'react';
import { useGameStore } from '@/lib/game/store';
import { calculateEquity } from '@/lib/math/equity';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TrainerTooltip() {
  const state = useGameStore(s => s.state);
  const { setRevealed } = useGameStore();
  
  const currentPlayer = state.players[state.currentTurn];
  
  // Only show for user turn during preflop
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
  const breakEvenPercentage = (potOdds * 100).toFixed(1);
  const equityPercentage = (equity * 100).toFixed(1);

  // Specific Recommendation Logic
  let recommendation = "";
  let recColor = "";
  
  if (callAmount === 0) {
    if (equity > 0.6) {
      recommendation = "Raise (Strong Hand)";
      recColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else {
      recommendation = "Check / Call";
      recColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  } else {
    if (equity > 0.7) {
      recommendation = "Raise (Very Strong)";
      recColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (isEvPlus) {
      recommendation = "Call (+EV)";
      recColor = "text-green-400 bg-green-500/10 border-green-500/20";
    } else {
      recommendation = "Fold (-EV)";
      recColor = "text-red-400 bg-red-500/10 border-red-500/20";
    }
  }

  if (!state.isRevealed) {
    return (
      <div className="absolute bottom-12 right-12 z-50 animate-in fade-in slide-in-from-right-4">
        <button 
          onClick={() => setRevealed(true)}
          className="group flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 p-4 rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl group-hover:bg-emerald-500/30">
            🧠
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-sm">Reveal Trainer Advice</div>
            <div className="text-slate-500 text-xs">Calculate Equity & Pot Odds</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-12 right-12 max-w-sm w-full bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
          <span>🧠</span> Trainer Insights
        </h3>
        <button 
          onClick={() => setRevealed(false)}
          className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider"
        >
          Hide [×]
        </button>
      </div>

      <div className={cn("mt-2 mb-4 px-3 py-2 rounded-lg border text-sm font-bold text-center uppercase tracking-widest flex flex-col items-center justify-center gap-1 shadow-inner", recColor)}>
          <span className="text-[10px] opacity-60 font-medium">Recommended Action</span>
          <span className="text-lg">{recommendation}</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Break-even % (Pot Odds)</span>
          <span className="text-white font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {breakEvenPercentage}%
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Actual Card Equity</span>
          <span className={`font-mono font-semibold px-2 py-0.5 rounded border ${equity >= potOdds ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-slate-200 bg-slate-800 border-slate-700'}`}>
            {equityPercentage}%
          </span>
        </div>
        
        <div className="pt-4 mt-2 border-t border-slate-800">
          <h4 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">The Maths</h4>
          <div className="space-y-2 text-[11px] font-mono leading-tight">
            <div className="bg-black/40 p-2 rounded text-slate-400 border border-slate-800/50">
              <span className="text-emerald-400 font-bold block mb-1">Pot Odds Calculation:</span>
              <span>Call: {callAmount} / (Pot: {state.pot} + Call: {callAmount})</span>
              <span className="block mt-0.5 text-white">= {potOdds.toFixed(4)} ({breakEvenPercentage}%)</span>
            </div>
            <div className="bg-black/40 p-2 rounded text-slate-400 border border-slate-800/50">
              <span className="text-emerald-400 font-bold block mb-1">Equity (n={activeOpponentsCount}):</span>
              <span>P(Win) + Σ [ P(Tie k) / (k+1) ]</span>
              <span className="block mt-0.5 text-white">= {(equity).toFixed(4)} ({equityPercentage}%)</span>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-1">
          <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-2">
            {callAmount === 0 
              ? "You can check for free! Checking is always EV neutral or better."
              : isEvPlus 
                ? `Profitable long-term.` 
                : `Losing play.`}
          </p>
        </div>
      </div>
    </div>
  );
}
