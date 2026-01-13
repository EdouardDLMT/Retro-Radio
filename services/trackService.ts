import { Track } from '../types';
import { INITIAL_TRACKS } from '../constants';
import { dbAddTrack, dbDeleteTrack, dbGetAllTracks } from './db';

// Now returns a Promise
export const getTracks = async (): Promise<Track[]> => {
  try {
    const storedTracks = await dbGetAllTracks();
    
    // If user has no tracks in DB, return default remote tracks
    if (storedTracks.length === 0) {
      // We map initial tracks to ensure they match the structure
      return INITIAL_TRACKS.map(t => ({...t, isLocal: false}));
    }
    
    return storedTracks;
  } catch (e) {
    console.error("Error loading tracks from DB", e);
    return INITIAL_TRACKS.map(t => ({...t, isLocal: false}));
  }
};

export const addTrack = async (name: string, file: File): Promise<Track[]> => {
  const id = Date.now().toString();
  const newTrack: Track = {
    id,
    name: name.toUpperCase().replace(/[^A-Z0-9_]/g, '_').substring(0, 25),
    url: URL.createObjectURL(file), // Transient URL for immediate UI feedback
    blob: file, // Store the actual file
    isLocal: true,
    offsetSeed: Math.floor(Math.random() * 7200)
  };

  await dbAddTrack(newTrack);
  return await getTracks();
};

export const removeTrack = async (id: string): Promise<Track[]> => {
  await dbDeleteTrack(id);
  return await getTracks();
};