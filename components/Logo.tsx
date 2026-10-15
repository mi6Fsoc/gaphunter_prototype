import React from 'react';

export const GapHunterLogo: React.FC<{ className?: string, showText?: boolean }> = ({ 
  className = "w-6 h-6",
  showText = false
}) => (
  <div className="flex items-center gap-2.5">
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer focus ring */}
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Subtle geometric outer bracket */}
        <circle cx="14" cy="14" r="12" stroke="#2A2A2E" strokeWidth="1.5" />
        
        {/* Lumina vermillion focus arc */}
        <path 
          d="M 14 2 A 12 12 0 0 1 26 14" 
          stroke="#E85D22" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        {/* Precision crosshair ticks */}
        <line x1="14" y1="5" x2="14" y2="8" stroke="#E85D22" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="14" y2="23" stroke="#A1A1AA" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="14" x2="8" y2="14" stroke="#A1A1AA" strokeWidth="1" strokeLinecap="round" />
        <line x1="20" y1="14" x2="23" y2="14" stroke="#E85D22" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Lumina vermillion focal core */}
        <circle cx="14" cy="14" r="3.5" fill="#E85D22" />
      </svg>
    </div>
    {showText && (
      <div className="flex items-baseline gap-1.5 font-sans">
        <span className="text-lg font-semibold tracking-tight text-white">GapHunter</span>
        <span className="text-[10px] font-mono font-medium tracking-wider text-lumina-orange uppercase">SYS</span>
      </div>
    )}
  </div>
);