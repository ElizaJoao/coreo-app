import { ALL_STYLES, DIFFICULTIES, DURATIONS } from "../constants/choreography";

export type ChoreographyStyle = (typeof ALL_STYLES)[number];
export type ChoreographyDifficulty = (typeof DIFFICULTIES)[number];
export type ChoreographyDurationMinutes = (typeof DURATIONS)[number];

export type Dancer = {
  id: string;
  name: string;
  color: string;
};

export type DancerPosition = {
  x: number; // 0–1 fraction of stage width
  y: number; // 0–1 fraction of stage height
};

export type MoveFormation = {
  moveId: string;
  positions: Record<string, DancerPosition>; // dancerId → position
};

export type PlaylistTrack = {
  title: string;
  artist: string;
  bpm: number;
};

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  startSec: number;
  endSec: number;
  previewUrl?: string;
  color?: string;
};

export type ChoreographyMusic = {
  title: string;
  artist: string;
  bpm: number;
  playlist?: PlaylistTrack[];
  tracks?: MusicTrack[];
};

export type ChoreographyMove = {
  id: string;
  name: string;
  duration: number;
  description: string;
  order: number;
  tag?: string;
  videoQuery?: string;  // pro+: YouTube search term for demo video
  videoId?: string;     // pro+: resolved YouTube video ID (cached)
  verbalCue?: string;   // max: what instructor says during this move
};

export type Choreography = {
  id: string;
  name: string;
  dancers?: Dancer[];
  formations?: MoveFormation[];
  style: ChoreographyStyle;
  duration: ChoreographyDurationMinutes;
  targetAudience: string;
  difficulty: ChoreographyDifficulty;
  description: string;
  music?: ChoreographyMusic;
  moves: ChoreographyMove[];
  createdAt: string;
  updatedAt: string;
  plays?: number;
  lastUsed?: string;
  isFavorite: boolean;
  tags: string[];
};

