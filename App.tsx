import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Track, PlayerState } from './types';
import { getTracks } from './services/trackService';
import LCDScreen from './components/LCDScreen';
import Backoffice from './components/Backoffice';
import Knob from './components/Knob';
import { Settings, Power, SkipForward, SkipBack } from 'lucide-react';

// Global start time to simulate the "infinite radio" world
const RADIO_SESSION_START = Date.now();

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackoffice, setShowBackoffice] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isOn: false,
    currentTrackIndex: 0,
    volume: 0.5,
    isPlaying: false,
    isTuning: false
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Initialization (Async) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedTracks = await getTracks();
        setTracks(loadedTracks);
      } catch (err) {
        console.error("Failed to load radio data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Safety check for track index bounds
  useEffect(() => {
    if (tracks.length > 0 && playerState.currentTrackIndex >= tracks.length) {
      setPlayerState(prev => ({ ...prev, currentTrackIndex: 0 }));
    }
  }, [tracks.length, playerState.currentTrackIndex]);

  const currentTrack = tracks[playerState.currentTrackIndex];

  // --- Audio Logic ---
  
  // seamless simulated broadcast timing
  const calculateSimulatedTime = useCallback((track: Track, duration: number) => {
    if (!duration) return 0;
    const timeElapsedSinceStart = (Date.now() - RADIO_SESSION_START) / 1000;
    const totalTimePointer = timeElapsedSinceStart + track.offsetSeed;
    return totalTimePointer % duration;
  }, []);

  const handleTrackLoad = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    const duration = audio.duration;
    if (isFinite(duration)) {
        const simulatedTime = calculateSimulatedTime(currentTrack, duration);
        audio.currentTime = simulatedTime;
        if (playerState.isOn && !playerState.isTuning) {
            audio.play().catch(e => {
                console.warn("Autoplay prevented (likely iOS interaction policy):", e);
                // On iOS, we might need to show a 'Tap to Play' if this fails, 
                // but the Power Button usually serves as the interaction.
            });
        }
    }
  };

  // Sync Audio Element with State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = playerState.volume;

    if (playerState.isOn && !playerState.isTuning && currentTrack) {
        if (audio.paused) {
             const duration = audio.duration || 0;
             const time = calculateSimulatedTime(currentTrack, duration);
             if (Math.abs(audio.currentTime - time) > 2) {
                 audio.currentTime = time;
             }
             audio.play().catch(e => console.error("Playback error:", e));
        }
    } else {
        audio.pause();
    }
  }, [playerState.isOn, playerState.isTuning, playerState.isPlaying, playerState.volume, currentTrack, calculateSimulatedTime]);


  // --- Controls ---

  const changeChannel = (direction: 'up' | 'down') => {
    if (!playerState.isOn) return;

    setPlayerState(prev => ({ ...prev, isTuning: true }));

    setTimeout(() => {
      setPlayerState(prev => {
        let nextIndex = direction === 'up' 
          ? prev.currentTrackIndex + 1 
          : prev.currentTrackIndex - 1;
        
        if (nextIndex >= tracks.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = tracks.length - 1;

        return { ...prev, currentTrackIndex: nextIndex, isTuning: false };
      });
    }, 800); // 800ms static effect
  };

  const togglePower = () => {
    setPlayerState(prev => {
      const newState = !prev.isOn;
      
      // IOS Audio Context Hack: When user toggles power, we ensure audio context is ready
      if (newState && audioRef.current) {
        audioRef.current.load(); // Forces iOS to acknowledge the media element
      }

      if (newState) {
        // Turning ON
        if (tracks.length === 0) return { ...prev, isOn: true, isPlaying: false };
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return { ...prev, isOn: true, currentTrackIndex: randomIndex, isPlaying: true };
      } else {
        // Turning OFF
        return { ...prev, isOn: false, isPlaying: false };
      }
    });
  };

  const handleVolumeChange = () => {
    setPlayerState(prev => {
        const newVol = prev.volume >= 1 ? 0.2 : parseFloat((prev.volume + 0.2).toFixed(1));
        return { ...prev, volume: newVol };
    });
  };

  // --- Render ---

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-green-500 font-mono">
            INITIALIZING SYSTEM...
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden no-select">
      
      {/* Hidden Audio Element - playsinline important for iOS */}
      <audio 
        ref={audioRef}
        src={currentTrack?.url}
        loop
        playsInline
        onLoadedMetadata={handleTrackLoad}
        onError={(e) => console.error("Audio Source Error", e)}
      />

      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-40 pointer-events-none"></div>

      {/* Main Deck Unit */}
      <section className="relative w-full max-w-2xl bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-[0_25px_60px_-12px_rgba(0,0,0,0.8)] border-t border-gray-700 p-8 border-b-8 border-b-black mb-safe-bottom">
        
        {/* Header / Branding */}
        <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${playerState.isOn ? 'bg-red-500 shadow-[0_0_12px_red]' : 'bg-red-900'}`}></div>
            <h1 className="text-2xl font-bold text-gray-200 tracking-[0.25em] italic font-sans">
              CHRONO<span className="text-red-500">WAVE</span>
            </h1>
          </div>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest border border-gray-700 px-2 py-1 rounded">
            PWA-18
          </div>
        </header>

        {/* Display Area */}
        <div className="mb-10 bg-[#111] p-1 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
            <LCDScreen state={playerState} currentTrack={currentTrack} />
        </div>

        {/* Control Surface */}
        <div className="bg-[#151515] p-6 rounded-lg border-t border-gray-700 shadow-inner flex flex-wrap md:flex-nowrap items-center justify-between gap-8">
          
          {/* Left: Power */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button 
              onClick={togglePower}
              aria-label={playerState.isOn ? "Turn Off" : "Turn On"}
              className={`
                w-16 h-16 rounded-full border-4 transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center touch-manipulation
                ${playerState.isOn 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-green-900 shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 border-red-900'}
              `}
            >
              <Power className={`w-6 h-6 transition-colors duration-300 ${playerState.isOn ? 'text-green-400 drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]' : 'text-red-700'}`} />
            </button>
            <span className="text-[10px] font-bold text-gray-500 tracking-widest mt-3 uppercase">Power</span>
          </div>

          {/* Center: Volume Knob */}
          <div className="flex flex-col items-center justify-center flex-1 border-l border-r border-gray-800 px-8">
            <Knob 
                label="Master Volume" 
                value={playerState.volume} 
                min={0}
                max={1}
                onClick={handleVolumeChange}
            />
          </div>

          {/* Right: Tuning Controls */}
          <div className="flex flex-col items-center justify-center flex-1">
             <div className="flex space-x-4 mb-3">
                <button 
                  onClick={() => changeChannel('down')}
                  disabled={!playerState.isOn}
                  aria-label="Previous Channel"
                  className="w-12 h-12 bg-gray-700 rounded shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 hover:text-white transition-all border border-gray-600 touch-manipulation"
                >
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button 
                   onClick={() => changeChannel('up')}
                   disabled={!playerState.isOn}
                   aria-label="Next Channel"
                   className="w-12 h-12 bg-gray-700 rounded shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 hover:text-white transition-all border border-gray-600 touch-manipulation"
                >
                   <SkipForward size={20} fill="currentColor" />
                </button>
             </div>
             <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tuning</span>
          </div>

        </div>

        {/* Backoffice Toggle */}
        <button 
            onClick={() => setShowBackoffice(true)}
            className="absolute top-6 right-6 text-gray-700 hover:text-green-500 transition-colors duration-300 p-2"
            aria-label="Open Settings"
        >
            <Settings size={20} />
        </button>

      </section>

      {/* Footer info */}
      <footer className="absolute bottom-4 text-center w-full pointer-events-none pb-safe-bottom">
        <p className="text-gray-700 font-mono text-[10px] uppercase tracking-widest opacity-50">
          Hi-Fidelity Audio System • 1985 Series
        </p>
      </footer>

      {showBackoffice && (
        <Backoffice 
            tracks={tracks} 
            onUpdate={setTracks} 
            onClose={() => setShowBackoffice(false)} 
        />
      )}
    </main>
  );
};

export default App;