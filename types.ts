export interface Track {
  id: string;
  name: string;
  url: string; // Blob URL for local files, http URL for remote
  blob?: Blob; // Stored in IndexedDB, not always in memory
  isLocal: boolean;
  offsetSeed: number;
}

export interface PlayerState {
  isOn: boolean;
  currentTrackIndex: number;
  volume: number; // 0 to 1
  isPlaying: boolean;
  isTuning: boolean;
}