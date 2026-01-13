import { Track } from './types';

// Using copyright-free music/ambient sounds for demonstration.
// In a real scenario, these would be the long radio mixes uploaded by the user.
export const INITIAL_TRACKS: Track[] = [
  {
    id: '1',
    name: 'SYNTHWAVE_MIX_VOL1',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3', // Placeholder long audio
    offsetSeed: Math.floor(Math.random() * 3600),
    isLocal: false
  },
  {
    id: '2',
    name: 'LATE_NIGHT_TALK',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    offsetSeed: Math.floor(Math.random() * 3600),
    isLocal: false
  },
  {
    id: '3',
    name: 'JAZZ_CAFE_85',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/intromusic.ogg',
    offsetSeed: Math.floor(Math.random() * 3600),
    isLocal: false
  },
  {
    id: '4',
    name: 'NEWS_BROADCAST_AM',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/win.ogg',
    offsetSeed: Math.floor(Math.random() * 3600),
    isLocal: false
  }
];