import { ALL_STYLES, DIFFICULTIES, DURATIONS } from "../constants/choreography";

export type ChoreographyStyle = (typeof ALL_STYLES)[number];
export type ChoreographyDifficulty = (typeof DIFFICULTIES)[number];
export type ChoreographyDurationMinutes = (typeof DURATIONS)[number];

export type ChoreographyMusic = {
  title: string;
  artist: string;
  bpm: number;
};

export type ChoreographyMove = {
  id: string;
  name: string;
  duration: number;
  description: string;
  order: number;
  tag?: string;
};

export type Choreography = {
  id: string;
  name: string;
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
};

