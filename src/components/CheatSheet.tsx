"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EQUITY_VALUES = [
  { rank: '2', val: '2.9%' },
  { rank: '3', val: '10.8%' },
  { rank: '4', val: '18.6%' },
  { rank: '5', val: '26.5%' },
  { rank: '6', val: '34.3%' },
  { rank: '7', val: '42.2%' },
  { rank: '8', val: '50.0%' },
  { rank: '9', val: '57.8%' },
  { rank: '10', val: '65.7%' },
  { rank: 'J', val: '73.5%' },
  { rank: 'Q', val: '81.4%' },
  { rank: 'K', val: '89.2%' },
  { rank: 'A', val: '97.1%' },
];

export function CheatSheet() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] p-2 flex justify-center">
      <div className={cn(
        "bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl transition-all duration-500 flex items-center gap-2 px-2 overflow-hidden",
        isVisible ? "max-w-full h-12" : "max-w-[48px] h-12"
      )}>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isVisible ? "Hide Cheat Sheet" : "Show Cheat Sheet"}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {isVisible && (
          <div className="flex items-center gap-1 pr-3 animate-in fade-in slide-in-from-left-4 duration-300 whitespace-nowrap">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest border-r border-slate-700 pr-3 mr-2">
              1-Opponent<br/>Equity
            </div>
            <div className="flex gap-1.5">
              {EQUITY_VALUES.map((item) => (
                <div key={item.rank} className="flex flex-col items-center justify-center min-w-[36px] bg-slate-800/50 border border-slate-700/30 rounded-lg py-1">
                  <span className="text-[10px] font-bold text-emerald-400 leading-none mb-0.5">{item.rank}</span>
                  <span className="text-[9px] font-mono text-slate-200 leading-none">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
