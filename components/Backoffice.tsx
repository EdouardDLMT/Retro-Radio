import React, { useState, useRef } from 'react';
import { Track } from '../types';
import { addTrack, removeTrack } from '../services/trackService';
import { Trash2, Plus, Radio, X, Upload, FileAudio, Loader2 } from 'lucide-react';

interface BackofficeProps {
  tracks: Track[];
  onUpdate: (newTracks: Track[]) => void;
  onClose: () => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ tracks, onUpdate, onClose }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      
      // Auto-generate a cool system name if empty
      if (!name) {
        const cleanName = selected.name
            .replace(/\.[^/.]+$/, "") // remove extension
            .replace(/[^a-zA-Z0-9]/g, '_') // replace non-alphanumeric with _
            .toUpperCase()
            .substring(0, 20);
        setName(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && file) {
      setIsProcessing(true);
      try {
        // Pass the actual File object to the service (Async)
        const updated = await addTrack(name, file);
        onUpdate(updated);
        
        // Reset Form
        setName('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Upload failed", error);
        alert("Storage Limit Reached or Error Saving.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this recording?")) {
        const updated = await removeTrack(id);
        onUpdate(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4 touch-manipulation">
      <div className="w-full h-full md:h-auto md:max-w-3xl bg-gray-900 md:border border-green-500/30 md:rounded-xl shadow-[0_0_50px_rgba(0,255,0,0.1)] overflow-hidden flex flex-col md:max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0 pt-safe-top">
          <div className="flex items-center space-x-2 text-green-400">
            <Radio size={20} />
            <h2 className="font-bold tracking-wider font-mono">TRANSMISSION CONTROL</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 flex flex-col md:flex-row overflow-y-auto">
          
          {/* Track List (Top on mobile) */}
          <div className="p-4 md:p-6 bg-black/20 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col h-1/2 md:h-full min-h-[250px]">
            <h3 className="text-gray-400 text-xs uppercase font-bold mb-4 tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Active Frequencies ({tracks.length})
            </h3>
            
            <div className="overflow-y-auto pr-2 space-y-2 scrollbar-thin flex-1 pb-4">
              {tracks.map(track => (
                <div key={track.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded border border-gray-700 hover:border-green-500/50 transition-all group">
                  <div className="overflow-hidden pr-3 flex-1 flex-shrink-1 min-w-0">
                    <div className="text-green-400 font-mono text-sm truncate select-none tracking-wide">{track.name}</div>
                    <div className="text-gray-600 text-[10px] truncate select-none font-mono">
                        {track.isLocal ? 'LOCAL STORAGE (IDB)' : 'NETWORK STREAM'}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(track.id);
                    }}
                    className="flex-shrink-0 text-gray-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded transition-all cursor-pointer z-10 relative"
                    title="Eject Frequency"
                  >
                    <Trash2 size={16} className="pointer-events-none" />
                  </button>
                </div>
              ))}
              {tracks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-800 rounded text-gray-600 text-xs font-mono">
                  <Radio className="mb-2 opacity-20" size={32} />
                  <span>NO SIGNAL DETECTED</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Form (Bottom on mobile) */}
          <div className="p-4 md:p-6 bg-gray-900 flex flex-col h-auto md:h-full pb-safe-bottom">
            <h3 className="text-gray-400 text-xs uppercase font-bold mb-4 tracking-widest">Inject New Signal</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              
              {/* File Input Area */}
              <div className="relative group">
                <label className="block text-[10px] text-green-500/70 mb-1 font-mono uppercase">Source Data (MP3)</label>
                <div className={`
                    border-2 border-dashed rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                    ${file ? 'border-green-500 bg-green-900/10' : 'border-gray-700 hover:border-green-500/50 hover:bg-gray-800'}
                `}>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {file ? (
                        <>
                            <FileAudio className="text-green-400 mb-3" size={32} />
                            <div className="text-sm font-bold text-green-300 max-w-full truncate px-4">
                                {file.name}
                            </div>
                            <div className="text-[10px] text-green-500/50 mt-1 uppercase">Ready to Load</div>
                        </>
                    ) : (
                        <>
                            <Upload className="text-gray-600 group-hover:text-green-400 mb-3 transition-colors" size={28} />
                            <div className="text-xs font-bold text-gray-500 group-hover:text-green-300">
                                INSERT DATA CARTRIDGE
                            </div>
                            <div className="text-[10px] text-gray-600 mt-1">TAP TO SELECT FILE</div>
                        </>
                    )}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-[10px] text-green-500/70 mb-1 font-mono uppercase">Frequency Label</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-green-400 p-3 rounded focus:border-green-500 outline-none font-mono placeholder-gray-800 uppercase"
                  placeholder="e.g. MASTER_TAPE_01"
                  maxLength={25}
                  autoComplete="off"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={!file || !name || isProcessing}
                className={`
                    w-full font-bold p-4 rounded flex items-center justify-center space-x-3 transition-all transform
                    ${file && name 
                        ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_20px_rgba(0,255,0,0.3)] active:scale-95' 
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                `}
              >
                {isProcessing ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        <span className="tracking-widest">ENCODING...</span>
                    </>
                ) : (
                    <>
                        {file && name ? <Plus size={20} /> : <Radio size={20} />}
                        <span className="tracking-widest">{file ? 'INITIALIZE TRACK' : 'WAITING FOR DATA...'}</span>
                    </>
                )}
              </button>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backoffice;