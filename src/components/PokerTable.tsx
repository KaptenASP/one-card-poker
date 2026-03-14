"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useGameLoop } from '@/lib/game/engine';
import { Player } from '@/types';

// Desktop positions (percentage based, for the oval)
const desktopPositions = [
  { left: '50%', top: '88%', transform: 'translate(-50%, -50%)' },  // User (Bottom)
  { left: '10%', top: '68%', transform: 'translate(-50%, -50%)' },  // Btm Left
  { left: '10%', top: '32%', transform: 'translate(-50%, -50%)' },  // Top Left
  { left: '50%', top: '12%', transform: 'translate(-50%, -50%)' },  // Top Center
  { left: '90%', top: '32%', transform: 'translate(-50%, -50%)' },  // Top Right
  { left: '90%', top: '68%', transform: 'translate(-50%, -50%)' },  // Btm Right
];

// Mobile: 3 column grid-like layout
const mobilePositions = [
  { left: '50%', top: '92%', transform: 'translate(-50%, -50%)' },  // User (Bottom center)
  { left: '18%', top: '72%', transform: 'translate(-50%, -50%)' },  // Mid left
  { left: '18%', top: '28%', transform: 'translate(-50%, -50%)' },  // Top left
  { left: '50%', top: '8%',  transform: 'translate(-50%, -50%)' },  // Top center
  { left: '82%', top: '28%', transform: 'translate(-50%, -50%)' },  // Top right
  { left: '82%', top: '72%', transform: 'translate(-50%, -50%)' },  // Mid right
];

function CardDisplay({ rank, suit, isHidden = false }: { rank: number; suit: string; isHidden?: boolean }) {
  if (isHidden) {
    return (
      <div className="w-8 h-11 sm:w-10 sm:h-14 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
        <div className="w-4 h-6 sm:w-5 sm:h-8 rounded-sm border border-[#333] opacity-40" />
      </div>
    );
  }

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitMap: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  const rankMap: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const suitChar = suitMap[suit] || '♠';
  const rankChar = rankMap[rank] || rank.toString();

  return (
    <div className="w-8 h-11 sm:w-10 sm:h-14 bg-white rounded border border-[#e5e5e5] flex flex-col justify-between items-center py-0.5 sm:py-1">
      <span className={`text-[10px] sm:text-xs font-semibold self-start pl-0.5 sm:pl-1 leading-none ${isRed ? 'text-red-500' : 'text-[#0a0a0a]'}`}>
        {rankChar}
      </span>
      <span className={`text-sm sm:text-lg leading-none ${isRed ? 'text-red-500' : 'text-[#0a0a0a]'}`}>
        {suitChar}
      </span>
    </div>
  );
}

function PlayerSeat({ player, index, isCurrentTurn, isDealer, isMobile }: { 
  player: Player; index: number; isCurrentTurn: boolean; isDealer: boolean; isMobile: boolean;
}) {
  const { stage } = useGameStore(s => s.state);
  const showCards = player.botArchetype === 'user' || stage === 'complete';
  const isUser = player.botArchetype === 'user';
  const positions = isMobile ? mobilePositions : desktopPositions;

  return (
    <div 
      className={`absolute flex flex-col items-center transition-all duration-200 ${!player.isActive ? 'opacity-30' : ''}`}
      style={positions[index]}
    >
      {/* Bet chip */}
      {player.currentBet > 0 && (
        <div className="absolute -top-7 sm:-top-9 text-[10px] sm:text-[11px] font-mono font-medium text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-1.5 sm:px-2 py-0.5 rounded-full">
          {player.currentBet}
        </div>
      )}

      {/* Dealer */}
      {isDealer && (
        <div className="absolute -right-2 sm:-right-4 -top-0.5 sm:-top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#fbbf24] text-[#0a0a0a] text-[8px] sm:text-[9px] font-bold flex items-center justify-center z-10">
          D
        </div>
      )}

      {/* Card */}
      {player.hand.length > 0 && player.isActive && (
        <div className="-mb-4 sm:-mb-5 z-10">
          {player.hand.map((c, i) => (
            <CardDisplay key={i} rank={c.rank} suit={c.suit} isHidden={!showCards} />
          ))}
        </div>
      )}

      {/* Name plate */}
      <div className={`
        relative z-20 flex flex-col items-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg min-w-[72px] sm:min-w-[110px]
        bg-[#111111] border transition-all duration-200
        ${isCurrentTurn ? 'border-[#10b981]/50 shadow-[0_0_12px_rgba(16,185,129,0.08)]' : 'border-[#1a1a1a]'}
        ${isUser ? 'border-[#2a2a2a]' : ''}
      `}>
        <span className={`text-[11px] sm:text-[13px] font-medium truncate max-w-full ${isUser ? 'text-[#e5e5e5]' : 'text-[#a3a3a3]'}`}>
          {player.name}
        </span>
        <span className="text-[10px] sm:text-[12px] font-mono text-[#fbbf24] mt-0.5">
          {player.chips}
        </span>
        {!isUser && (
          <span className="text-[7px] sm:text-[9px] text-[#404040] uppercase tracking-widest mt-0.5 font-medium hidden sm:block">
            {player.botArchetype.replace('-', ' ')}
          </span>
        )}
      </div>
    </div>
  );
}

export function PokerTable() {
  const { state, dealerIndex, startHand, applyAction, advanceTurn } = useGameStore();
  const [isMobile, setIsMobile] = React.useState(false);

  useGameLoop();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
    <div className="w-full flex flex-col items-center justify-center relative px-2 sm:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10 mt-12 sm:mt-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#e5e5e5] tracking-tight">
          Boring Poker
        </h1>
        <p className="text-[11px] sm:text-[13px] text-[#525252] mt-1 font-normal">
          1-card Hold&apos;em · 6-max · exact combinatorics
        </p>
      </div>

      {/* Table */}
      <div className="relative w-full max-w-3xl aspect-[3/4] sm:aspect-[2/1] rounded-[40%] sm:rounded-[50%] bg-gradient-to-b from-[#0f3d2a] to-[#0a2e1f] border border-[#1a4a35] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] flex items-center justify-center">
        {/* Rail */}
        <div className="absolute inset-[-8px] sm:inset-[-12px] rounded-[40%] sm:rounded-[50%] border-4 sm:border-[6px] border-[#1a1a1a] pointer-events-none" />

        {/* Pot */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] sm:text-[10px] text-[#525252] uppercase tracking-[0.2em] font-medium">Pot</span>
          <span className="text-xl sm:text-2xl font-mono font-semibold text-[#fbbf24] mt-0.5">{state.pot}</span>
        </div>

        {/* Players */}
        {state.players.map((p, idx) => (
          <PlayerSeat 
            key={p.id} 
            player={p} 
            index={p.seatIndex} 
            isCurrentTurn={state.stage === 'preflop' && state.currentTurn === idx} 
            isDealer={dealerIndex === idx}
            isMobile={isMobile}
          />
        ))}

        {/* Winner banner */}
        {state.stage === 'complete' && state.actionLog.length > 0 && (
          <div className="absolute -bottom-5 sm:-bottom-6 text-[10px] sm:text-[12px] font-medium text-[#10b981] bg-[#10b981]/8 border border-[#10b981]/15 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full max-w-[90%] text-center truncate">
            {state.actionLog[state.actionLog.length - 1]}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`
        mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-2 transition-all duration-200 px-2
        ${state.stage === 'complete' ? 'opacity-100' : (isUserTurn ? 'opacity-100' : 'opacity-20 pointer-events-none')}
      `}>
        {state.stage === 'complete' ? (
          <button 
            onClick={startHand}
            className="h-10 px-6 bg-[#111111] hover:bg-[#191919] text-[#e5e5e5] text-[13px] font-medium rounded-lg border border-[#2a2a2a] hover:border-[#333] transition-all"
          >
            Deal Next Hand
          </button>
        ) : (
          <>
            <button 
              onClick={() => handleAction('fold')}
              className="h-9 sm:h-10 px-4 sm:px-5 bg-[#111111] hover:bg-[#191919] text-[#737373] hover:text-[#e5e5e5] text-[12px] sm:text-[13px] font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
            >
              Fold
            </button>
            <button 
              onClick={() => handleAction('call')}
              className="h-9 sm:h-10 px-4 sm:px-5 bg-[#111111] hover:bg-[#191919] text-[#e5e5e5] text-[12px] sm:text-[13px] font-medium rounded-lg border border-[#2a2a2a] hover:border-[#333] transition-all"
            >
              {callAmount === 0 ? 'Check' : callAmount >= (user?.chips ?? 0) ? `All-In · ${user?.chips}` : `Call · ${callAmount}`}
            </button>
            {(() => {
              if (!user || user.chips <= 0) return null;
              const chipsLeft = user.chips;
              const toCall = Math.max(0, state.highestBet - user.currentBet);
              const chipsAfterCall = chipsLeft - Math.min(toCall, chipsLeft);
              
              if (chipsAfterCall <= 0) return null;
              
              const base = state.lastRaiseAmount;
              const raiseOptions = [
                { amount: base * 2 },
                { amount: base * 4 },
                { amount: base * 5 },
              ];
              
              const seen = new Set<number>();
              const buttons: React.ReactNode[] = [];
              let allInAdded = false;

              for (let i = 0; i < raiseOptions.length; i++) {
                const opt = raiseOptions[i];
                const totalNeeded = toCall + opt.amount;
                
                if (totalNeeded >= chipsLeft) {
                  if (!allInAdded) {
                    allInAdded = true;
                    buttons.push(
                      <button 
                        key="all-in"
                        onClick={() => handleAction('raise', chipsLeft)}
                        className="h-9 sm:h-10 px-4 sm:px-5 bg-[#10b981]/10 hover:bg-[#10b981]/15 text-[#10b981] text-[12px] sm:text-[13px] font-medium rounded-lg border border-[#10b981]/20 hover:border-[#10b981]/30 transition-all"
                      >
                        All-In · {chipsLeft}
                      </button>
                    );
                  }
                } else if (!seen.has(opt.amount)) {
                  seen.add(opt.amount);
                  buttons.push(
                    <button 
                      key={opt.amount}
                      onClick={() => handleAction('raise', opt.amount)}
                      className="h-9 sm:h-10 px-4 sm:px-5 bg-[#111111] hover:bg-[#191919] text-[#a3a3a3] hover:text-[#e5e5e5] text-[12px] sm:text-[13px] font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
                    >
                      +{opt.amount}
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
