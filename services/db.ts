import { Track } from '../types';

const DB_NAME = 'RetroRadioDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

// Open Database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Database error: ' + (event.target as IDBOpenDBRequest).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Add Track (Blob)
export const dbAddTrack = async (track: Track): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    // We store the Blob, but NOT the blob URL (which is temporary)
    const { url, ...trackToStore } = track;
    const request = store.put(trackToStore);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get All Tracks
export const dbGetAllTracks = async (): Promise<Track[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result;
      // Reconstitute the Blob URL from the stored Blob
      const tracks: Track[] = results.map((t: any) => ({
        ...t,
        url: t.blob ? URL.createObjectURL(t.blob) : t.url || '', // Create new transient URL
      }));
      resolve(tracks);
    };
    request.onerror = () => reject(request.error);
  });
};

// Delete Track
export const dbDeleteTrack = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};