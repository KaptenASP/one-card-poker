"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useGameLoop } from '@/lib/game/engine';
import { Player } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fixed positions for 6 max players
const positions = [
  { left: '50%', top: '90%', transform: 'translate(-50%, -50%)' }, // User (Bottom)
  { left: '15%', top: '75%', transform: 'translate(-50%, -50%)' }, // Btm Left
  { left: '15%', top: '25%', transform: 'translate(-50%, -50%)' }, // Top Left
  { left: '50%', top: '10%', transform: 'translate(-50%, -50%)' }, // Top Center
  { left: '85%', top: '25%', transform: 'translate(-50%, -50%)' }, // Top Right
  { left: '85%', top: '75%', transform: 'translate(-50%, -50%)' }, // Btm Right
];

function Card({ rank, suit, isHidden = false }: { rank: number; suit: string; isHidden?: boolean }) {
  if (isHidden) {
    return (
      <div className="w-12 h-16 rounded-md bg-gradient-to-br from-red-700 to-red-900 border-2 border-slate-300 shadow-md flex items-center justify-center">
        <div className="w-8 h-12 border border-red-400 opacity-50 rounded-sm"></div>
      </div>
    );
  }

  const isRed = suit === 'hearts' || suit === 'diamonds';
  let suitChar = '♠';
  if (suit === 'hearts') suitChar = '♥';
  if (suit === 'diamonds') suitChar = '♦';
  if (suit === 'clubs') suitChar = '♣';

  let rankChar = rank.toString();
  if (rank === 11) rankChar = 'J';
  if (rank === 12) rankChar = 'Q';
  if (rank === 13) rankChar = 'K';
  if (rank === 14) rankChar = 'A';

  return (
    <div className="w-12 h-16 bg-white rounded-md border border-slate-300 shadow-md flex flex-col justify-between items-center py-1 font-bold">
      <div className={cn("text-sm self-start pl-1 leading-none", isRed ? "text-red-500" : "text-black")}>
        {rankChar}
      </div>
      <div className={cn("text-2xl", isRed ? "text-red-500" : "text-black")}>
        {suitChar}
      </div>
    </div>
  );
}

function PlayerAvatar({ player, index, isCurrentTurn, isDealer }: { player: Player; index: number; isCurrentTurn: boolean; isDealer: boolean }) {
  const { stage } = useGameStore(s => s.state);
  
  // Only reveal bot cards at showdown
  const showCards = player.botArchetype === 'user' || stage === 'complete';

  return (
    <div 
      className={cn(
        "absolute flex flex-col items-center transition-all duration-300",
        !player.isActive && "opacity-50 grayscale"
      )}
      style={positions[index]}
    >
      {/* Current Bet indicator */}
      {player.currentBet > 0 && (
        <div className="absolute -top-12 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap animate-in zoom-in">
          Bet: {player.currentBet}
        </div>
      )}

      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -right-5 -top-2 bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shadow-md border-2 border-slate-300 z-10">
          D
        </div>
      )}

      {/* Cards */}
      {player.hand.length > 0 && player.isActive && (
        <div className="flex gap-1 -mb-6 z-10">
          {player.hand.map((c, i) => (
            <Card key={i} rank={c.rank} suit={c.suit} isHidden={!showCards} />
          ))}
        </div>
      )}

      {/* Avatar Container */}
      <div className={cn(
        "bg-slate-800 border-2 rounded-xl p-3 min-w-[130px] shadow-xl relative z-20 flex flex-col items-center",
        isCurrentTurn ? "border-green-400 ring-4 ring-green-500/20 shadow-green-500/30" : "border-slate-600",
        player.botArchetype === 'user' ? "shadow-blue-500/20" : ""
      )}>
        <span className="text-white font-bold text-sm tracking-wide truncate max-w-full">
          {player.name}
        </span>
        <span className="text-amber-400 font-mono text-sm mt-1 rounded bg-black/40 px-2 py-0.5">
          ${player.chips}
        </span>
        
        {player.botArchetype !== 'user' && (
          <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider text-center line-clamp-1">
            {player.botArchetype.replace('-', ' ')}
          </span>
        )}
      </div>
    </div>
  );
}

export function PokerTable() {
  const { state, dealerIndex, startHand, applyAction, advanceTurn } = useGameStore();

  useGameLoop(); // Start the bot automation engine

  // Auto-start hand on mount if needed
  useEffect(() => {
    if (state.stage === 'complete' && state.players[0].hand.length === 0) {
      startHand();
    }
  }, [state.stage, state.players, startHand]);

  const user = state.players.find(p => p.botArchetype === 'user');
  const isUserTurn = state.stage === 'preflop' && state.players[state.currentTurn]?.id === user?.id;

  const handleAction = (type: 'fold' | 'call' | 'raise', amount?: number) => {
    if (isUserTurn) {
      applyAction(type, amount);
      advanceTurn();
    }
  };

  const callAmount = user ? state.highestBet - user.currentBet : 0;

  return (
    <div className="w-full h-full min-h-[700px] flex flex-col items-center justify-center p-8 relative">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-2">
          Boring Poker 1-Card Trainer
        </h1>
        <p className="text-slate-400 font-medium">Learn optimal pushing frequencies through exact combinatorics.</p>
      </div>

      {/* The Table */}
      <div className="relative w-full max-w-4xl aspect-[2/1] bg-gradient-to-b from-green-700 to-emerald-950 border-[20px] border-amber-950 rounded-full shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
        {/* Pot Area */}
        <div className="absolute inset-0 m-auto w-48 h-24  flex flex-col items-center justify-center bg-black/30 rounded-full backdrop-blur-sm border border-white/5">
          <span className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-1">Total Pot</span>
          <span className="text-amber-400 font-mono text-3xl font-extrabold">${state.pot}</span>
        </div>

        {/* Players */}
        {state.players.map((p, idx) => (
          <PlayerAvatar 
            key={p.id} 
            player={p} 
            index={p.seatIndex} 
            isCurrentTurn={state.stage === 'preflop' && state.currentTurn === idx} 
            isDealer={dealerIndex === idx}
          />
        ))}

        {/* Action Log / Result Banner */}
        {state.stage === 'complete' && state.actionLog.length > 0 && (
          <div className="absolute -bottom-8 bg-green-500 text-black px-6 py-2 rounded-full font-bold shadow-lg shadow-green-500/20 border-2 border-green-400 animate-in fade-in slide-in-from-bottom-5">
            {state.actionLog[state.actionLog.length - 1]}
          </div>
        )}
      </div>

      {/* User Controls */}
      <div className={cn(
        "mt-16 flex items-center justify-center gap-4 transition-all duration-300",
        state.stage === 'complete' ? "opacity-100" : (isUserTurn ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 pointer-events-none grayscale")
      )}>
        {state.stage === 'complete' ? (
          <button 
            onClick={startHand}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-12 rounded-xl text-lg shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 border-b-4 border-emerald-800"
          >
            Deal Next Hand
          </button>
        ) : (
          <>
            <button 
              onClick={() => handleAction('fold')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-900"
            >
              Fold
            </button>
            <button 
              onClick={() => handleAction('call')}
              className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-b-4 border-green-900 min-w-[140px]"
            >
              {callAmount === 0 ? 'Check' : callAmount >= (user?.chips ?? 0) ? `All-In (${user?.chips})` : `Call ${callAmount}`}
            </button>
            {(() => {
              if (!user || user.chips <= 0) return null;
              const chipsLeft = user.chips;
              const toCall = Math.max(0, state.highestBet - user.currentBet);
              const chipsAfterCall = chipsLeft - Math.min(toCall, chipsLeft);
              
              // If calling alone would be all-in, no raise options
              if (chipsAfterCall <= 0) return null;
              
              const base = state.lastRaiseAmount;
              const raiseOptions = [
                { label: `2×`, amount: base * 2 },
                { label: `4×`, amount: base * 4 },
                { label: `5×`, amount: base * 5 },
              ];
              
              const colors = [
                'bg-rose-600 hover:bg-rose-500 border-rose-800',
                'bg-rose-700 hover:bg-rose-600 border-rose-900',
                'bg-rose-800 hover:bg-rose-700 border-rose-950',
              ];

              // Filter to only options the player can afford and deduplicate 
              const seen = new Set<number>();
              const buttons: React.ReactNode[] = [];
              let allInAdded = false;

              for (let i = 0; i < raiseOptions.length; i++) {
                const opt = raiseOptions[i];
                const totalNeeded = toCall + opt.amount;
                
                if (totalNeeded >= chipsLeft) {
                  // This raise would be all-in or more — show one All-In button
                  if (!allInAdded) {
                    allInAdded = true;
                    buttons.push(
                      <button 
                        key="all-in"
                        onClick={() => handleAction('raise', chipsLeft)}
                        className={`text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-b-4 ${colors[i]}`}
                      >
                        All-In ({chipsLeft})
                      </button>
                    );
                  }
                } else if (!seen.has(opt.amount)) {
                  seen.add(opt.amount);
                  buttons.push(
                    <button 
                      key={opt.amount}
                      onClick={() => handleAction('raise', opt.amount)}
                      className={`text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-b-4 ${colors[i]}`}
                    >
                      Raise +{opt.amount}
                    </button>
                  );
                }
              }

              return buttons;
            })()}
          </>
        )}
      </div>
    </div>
  );
}
