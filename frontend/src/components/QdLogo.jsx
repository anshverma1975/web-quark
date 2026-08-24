import React from 'react';

export default function QdLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="qdlogo" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#a7c3b6" />
          <stop offset="100%" stopColor="#7fa393" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="18" stroke="url(#qdlogo)" strokeWidth="3" fill="none" />
      <path d="M32 8 A 24 24 0 0 1 56 32" stroke="url(#qdlogo)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M56 32 L 60 26 M56 32 L 60 38" stroke="url(#qdlogo)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="32" r="6" fill="url(#qdlogo)" />
    </svg>
  );
}
