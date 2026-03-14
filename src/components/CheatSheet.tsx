"use client";

import React, { useState } from 'react';

const EQUITY_VALUES = [
  { rank: '2', val: '2.9' },
  { rank: '3', val: '10.8' },
  { rank: '4', val: '18.6' },
  { rank: '5', val: '26.5' },
  { rank: '6', val: '34.3' },
  { rank: '7', val: '42.2' },
  { rank: '8', val: '50.0' },
  { rank: '9', val: '57.8' },
  { rank: '10', val: '65.7' },
  { rank: 'J', val: '73.5' },
  { rank: 'Q', val: '81.4' },
  { rank: 'K', val: '89.2' },
  { rank: 'A', val: '97.1' },
];

export function CheatSheet() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] flex justify-center py-2 sm:py-3 px-2 sm:px-4">
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden transition-all duration-300 max-w-full">
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="px-3 h-9 flex items-center justify-center gap-2 text-[#737373] hover:text-[#e5e5e5] transition-colors border-b sm:border-b-0 sm:border-r border-[#1a1a1a] shrink-0"
          title={isVisible ? "Hide" : "Show"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isVisible ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
          <span className="text-[11px] font-medium sm:hidden">1v1 Equity</span>
        </button>

        {isVisible && (
          <div className="flex items-center gap-0 sm:gap-0.5 px-1.5 sm:px-2 py-1.5 overflow-x-auto">
            <span className="text-[9px] sm:text-[10px] text-[#525252] font-medium uppercase tracking-wider mr-1.5 sm:mr-2 whitespace-nowrap hidden sm:block">1v1</span>
            {EQUITY_VALUES.map((item) => (
              <div key={item.rank} className="flex flex-col items-center px-1 sm:px-1.5 py-0.5 shrink-0">
                <span className="text-[9px] sm:text-[10px] font-medium text-[#e5e5e5] leading-none">{item.rank}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-[#525252] leading-none mt-0.5">{item.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
