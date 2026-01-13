import React, { useEffect, useState } from 'react';
import { PlayerState, Track } from '../types';
import { Wifi, Activity } from 'lucide-react';

interface LCDScreenProps {
  state: PlayerState;
  currentTrack?: Track;
}

const LCDScreen: React.FC<LCDScreenProps> = ({ state, currentTrack }) => {
  const [scrollText, setScrollText] = useState('');

  // Text scrolling logic
  useEffect(() => {
    if (!state.isOn || !currentTrack) return;
    
    const text = `/// NOW PLAYING: ${currentTrack.name} /// STEREO FM /// `;
    let i = 0;
    
    const interval = setInterval(() => {
      setScrollText(text.substring(i) + text.substring(0, i));
      i = (i + 1) % text.length;
    }, 250);

    return () => clearInterval(interval);
  }, [state.isOn, currentTrack]);

  if (!state.isOn) {
    return (
      <div className="w-full h-32 md:h-40 bg-[#1a221a] border-4 border-gray-700 rounded-lg inset-shadow flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        <div className="opacity-10 text-[#2a332a] digital-font text-4xl">OFF AIR</div>
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-32 md:h-40 bg-[#152915] border-4 border-gray-600 rounded-lg relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] transition-colors duration-500">
      {/* Screen Glow */}
      <div className="absolute inset-0 bg-[#39ff14] opacity-5 pointer-events-none animate-pulse"></div>
      <div className="scanlines absolute inset-0 z-10"></div>

      <div className="relative z-20 p-4 flex flex-col justify-between h-full text-[#39ff14] digital-font tracking-widest">
        
        {/* Top Row: Status Icons & Frequency */}
        <div className="flex justify-between items-start">
          <div className="flex space-x-3 text-xs">
            <div className="flex flex-col items-center">
              <Wifi size={16} className="animate-pulse" />
              <span>STEREO</span>
            </div>
            {state.isTuning && (
              <div className="animate-bounce text-red-400">TUNING...</div>
            )}
          </div>
          <div className="text-3xl md:text-4xl font-bold drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
            {(88.1 + state.currentTrackIndex * 1.2).toFixed(1)} <span className="text-sm">MHz</span>
          </div>
        </div>

        {/* Middle: Visualizer / Activity */}
        <div className="flex items-center space-x-1 h-8 opacity-80">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 bg-[#39ff14]"
              style={{ 
                height: `${state.isTuning ? 10 : Math.random() * 100}%`,
                transition: 'height 0.1s ease'
              }}
            ></div>
          ))}
        </div>

        {/* Bottom: Scrolling Text */}
        <div className="overflow-hidden whitespace-nowrap border-t border-[#39ff14]/30 pt-1">
          <div className="text-lg uppercase drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
            {state.isTuning ? 'SEARCHING SIGNAL...' : scrollText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCDScreen;