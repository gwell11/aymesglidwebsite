"use client";

export default function PCBTraces() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 opacity-30">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Main horizontal traces spanning the full width - Multiple colors */}
        <path d="M 0 15 L 100 15" stroke="#0f766e" strokeWidth="0.15" fill="none"/>
        <path d="M 0 25 L 100 25" stroke="#7c3aed" strokeWidth="0.12" fill="none"/>
        <path d="M 0 35 L 100 35" stroke="#dc2626" strokeWidth="0.15" fill="none"/>
        <path d="M 0 45 L 100 45" stroke="#ea580c" strokeWidth="0.1" fill="none"/>
        <path d="M 0 55 L 100 55" stroke="#0891b2" strokeWidth="0.15" fill="none"/>
        <path d="M 0 65 L 100 65" stroke="#059669" strokeWidth="0.12" fill="none"/>
        <path d="M 0 75 L 100 75" stroke="#f59e0b" strokeWidth="0.15" fill="none"/>
        <path d="M 0 85 L 100 85" stroke="#8b5cf6" strokeWidth="0.1" fill="none"/>
        
        {/* Main vertical traces spanning the full height - Multiple colors */}
        <path d="M 10 0 L 10 100" stroke="#be185d" strokeWidth="0.15" fill="none"/>
        <path d="M 20 0 L 20 100" stroke="#06b6d4" strokeWidth="0.12" fill="none"/>
        <path d="M 30 0 L 30 100" stroke="#10b981" strokeWidth="0.15" fill="none"/>
        <path d="M 40 0 L 40 100" stroke="#ef4444" strokeWidth="0.1" fill="none"/>
        <path d="M 50 0 L 50 100" stroke="#f97316" strokeWidth="0.15" fill="none"/>
        <path d="M 60 0 L 60 100" stroke="#84cc16" strokeWidth="0.12" fill="none"/>
        <path d="M 70 0 L 70 100" stroke="#3b82f6" strokeWidth="0.15" fill="none"/>
        <path d="M 80 0 L 80 100" stroke="#a855f7" strokeWidth="0.1" fill="none"/>
        <path d="M 90 0 L 90 100" stroke="#ec4899" strokeWidth="0.12" fill="none"/>
        
        {/* Flowing diagonal traces that cross the entire screen - Multiple colors */}
        <path d="M 0 0 L 30 30 L 60 15 L 100 45" stroke="#7c2d12" strokeWidth="0.12" fill="none"/>
        <path d="M 0 100 L 25 75 L 50 85 L 75 65 L 100 75" stroke="#164e63" strokeWidth="0.12" fill="none"/>
        <path d="M 0 50 L 40 20 L 80 60 L 100 30" stroke="#581c87" strokeWidth="0.1" fill="none"/>
        <path d="M 0 30 L 35 70 L 70 40 L 100 80" stroke="#92400e" strokeWidth="0.1" fill="none"/>
        
        {/* Complex flowing routes that weave across the screen - Multiple colors */}
        <path d="M 5 10 L 15 10 L 15 20 L 35 20 L 35 5 L 55 5 L 55 30 L 75 30 L 75 12 L 95 12" stroke="#dc2626" strokeWidth="0.12" fill="none"/>
        <path d="M 5 90 L 25 90 L 25 70 L 45 70 L 45 95 L 65 95 L 65 75 L 85 75 L 85 88 L 95 88" stroke="#059669" strokeWidth="0.12" fill="none"/>
        
        {/* Branching patterns that spread across the screen - Multiple colors */}
        <path d="M 0 40 L 20 40 L 20 60 L 40 60" stroke="#7c3aed" strokeWidth="0.1" fill="none"/>
        <path d="M 20 40 L 20 25" stroke="#7c3aed" strokeWidth="0.1" fill="none"/>
        <path d="M 60 60 L 80 60 L 80 40 L 100 40" stroke="#f59e0b" strokeWidth="0.1" fill="none"/>
        <path d="M 80 60 L 80 80" stroke="#f59e0b" strokeWidth="0.1" fill="none"/>
        
        {/* More diagonal crosses and interconnects - Multiple colors */}
        <path d="M 12 5 L 25 18 L 38 8 L 52 22 L 68 12 L 82 28 L 95 18" stroke="#ef4444" strokeWidth="0.08" fill="none"/>
        <path d="M 8 95 L 22 82 L 35 92 L 48 78 L 62 88 L 78 72 L 92 85" stroke="#8b5cf6" strokeWidth="0.08" fill="none"/>
        
        {/* Connection nodes at strategic intersections - Multiple colors */}
        <circle cx="10" cy="15" r="0.3" fill="#be185d"/>
        <circle cx="20" cy="25" r="0.3" fill="#7c3aed"/>
        <circle cx="30" cy="35" r="0.3" fill="#dc2626"/>
        <circle cx="40" cy="45" r="0.3" fill="#ea580c"/>
        <circle cx="50" cy="55" r="0.3" fill="#0891b2"/>
        <circle cx="60" cy="65" r="0.3" fill="#059669"/>
        <circle cx="70" cy="75" r="0.3" fill="#f59e0b"/>
        <circle cx="80" cy="85" r="0.3" fill="#8b5cf6"/>
        
        <circle cx="90" cy="15" r="0.3" fill="#06b6d4"/>
        <circle cx="80" cy="25" r="0.3" fill="#10b981"/>
        <circle cx="70" cy="35" r="0.3" fill="#ef4444"/>
        <circle cx="60" cy="45" r="0.3" fill="#f97316"/>
        <circle cx="50" cy="15" r="0.3" fill="#84cc16"/>
        <circle cx="40" cy="25" r="0.3" fill="#3b82f6"/>
        <circle cx="30" cy="75" r="0.3" fill="#a855f7"/>
        <circle cx="20" cy="85" r="0.3" fill="#ec4899"/>
        
        {/* Additional flowing interconnects - Multiple colors */}
        <path d="M 15 30 L 25 30 L 25 50 L 35 50 L 35 70 L 45 70" stroke="#0891b2" strokeWidth="0.08" fill="none"/>
        <path d="M 55 30 L 65 30 L 65 50 L 75 50 L 75 70 L 85 70" stroke="#f97316" strokeWidth="0.08" fill="none"/>
        <path d="M 15 80 L 35 80 L 35 60 L 55 60 L 55 40 L 75 40 L 75 20 L 95 20" stroke="#84cc16" strokeWidth="0.08" fill="none"/>
        
        {/* Corner-to-corner flowing traces - Multiple colors */}
        <path d="M 0 5 L 15 5 L 15 95 L 100 95" stroke="#ec4899" strokeWidth="0.08" fill="none"/>
        <path d="M 100 5 L 85 5 L 85 95 L 0 95" stroke="#3b82f6" strokeWidth="0.08" fill="none"/>
        
        {/* Additional connection points - Multiple colors */}
        <circle cx="15" cy="5" r="0.25" fill="#ec4899"/>
        <circle cx="85" cy="5" r="0.25" fill="#3b82f6"/>
        <circle cx="15" cy="95" r="0.25" fill="#ec4899"/>
        <circle cx="85" cy="95" r="0.25" fill="#3b82f6"/>
        
        {/* Small branch circuits - Multiple colors */}
        <circle cx="25" cy="30" r="0.25" fill="#0891b2"/>
        <circle cx="35" cy="50" r="0.25" fill="#0891b2"/>
        <circle cx="65" cy="30" r="0.25" fill="#f97316"/>
        <circle cx="75" cy="50" r="0.25" fill="#f97316"/>
        <circle cx="35" cy="80" r="0.25" fill="#84cc16"/>
        <circle cx="55" cy="60" r="0.25" fill="#84cc16"/>
        <circle cx="75" cy="40" r="0.25" fill="#84cc16"/>
      </svg>
    </div>
  );
}
