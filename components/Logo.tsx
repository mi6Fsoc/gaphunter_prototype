import React from 'react';

export const GapHunterLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" />
    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" />
    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" />
    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" />
  </svg>
);