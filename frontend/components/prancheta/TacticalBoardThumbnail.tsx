import React from 'react';
import TacticalBoard from './TacticalBoard';

interface TacticalBoardThumbnailProps {
  tacticData: any;
  className?: string;
}

export function TacticalBoardThumbnail({ tacticData, className = '' }: TacticalBoardThumbnailProps) {
  if (!tacticData) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-md text-slate-500 text-sm ${className}`}>
        Sem prancheta
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden pointer-events-none rounded-md bg-[#1b4332] ${className}`}>
      {/* Container wrapper for styling */}
      <div className="absolute inset-0 w-[100%] h-[100%] transform origin-center">
        <TacticalBoard 
          initialTacticData={tacticData} 
          readOnly={true} 
          thumbnail={true} 
        />
      </div>
    </div>
  );
}
