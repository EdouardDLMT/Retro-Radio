import React from 'react';

interface KnobProps {
  label: string;
  value: number; 
  min?: number;
  max?: number;
  onClick: () => void;
}

const Knob: React.FC<KnobProps> = ({ label, value, min = 0, max = 1, onClick }) => {
  // Calculate rotation angle based on value (-135deg to 135deg is standard for knobs)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);

  return (
    <div className="flex flex-col items-center group cursor-pointer tap-highlight-transparent select-none" onClick={onClick}>
      
      {/* Knob Body */}
      <div className="relative w-20 h-20 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] bg-gradient-to-b from-gray-700 to-black p-1 active:scale-95 transition-transform duration-100 ease-out">
        
        {/* Outer Ring Detail */}
        <div className="absolute inset-0 rounded-full border border-gray-600 opacity-50"></div>
        
        {/* The Rotating Part */}
        <div 
            className="w-full h-full rounded-full bg-[#1a1a1a] border-4 border-gray-800 relative shadow-inner"
            style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
            {/* Indicator Line */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
        </div>
        
        {/* Shine Reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none"></div>
      </div>

      {/* Label & Value */}
      <div className="mt-3 text-center">
        <span className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase group-hover:text-gray-300 transition-colors">
            {label}
        </span>
      </div>
    </div>
  );
};

export default Knob;