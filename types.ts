

export interface Team {
  id: string;
  name: string;
  color: string;
  hex: string;
}

export type ScoringType = 'ranking-30' | 'ranking-40' | 'success-10';

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  rounds: number;
  scoringType: ScoringType;
}

export interface ScoreData {
  teamId: string;
  gameId: string;
  roundIndex: number; // 0-based
  points: number;
}

export interface RankingEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  rank: number;
}