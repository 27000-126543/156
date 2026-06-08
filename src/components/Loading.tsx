
import React from 'react';
import { Waves } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ text = '加载中...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Waves size={48} className="text-ocean-400 animate-pulse" />
        <div className="absolute inset-0 animate-ping">
          <Waves size={48} className="text-ocean-400/30" />
        </div>
      </div>
      <p className="text-white/70 text-sm font-medium">{text}</p>
      <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-ocean-400 to-seaweed-400 rounded-full animate-[shimmer_1.5s_infinite]" 
             style={{ width: '60%', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-ocean-950/90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
