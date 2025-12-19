

import { Team, Game } from './types';

export const TEAMS: Team[] = [
  { id: 'team-red', name: '赤チーム', color: 'bg-red-500', hex: '#ef4444' },
  { id: 'team-blue', name: '青チーム', color: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'team-yellow', name: '黄チーム', color: 'bg-yellow-400', hex: '#facc15' },
  { id: 'team-green', name: '緑チーム', color: 'bg-green-500', hex: '#22c55e' },
];

export const GAMES: Game[] = [
  { 
    id: 'game-dengon', 
    name: '伝言ゲーム', 
    description: '全5問。各問ごとに順位で得点が入ります。', 
    icon: '🗣️',
    rounds: 5,
    scoringType: 'ranking-30'
  },
  { 
    id: 'game-visual', 
    name: '動体視力ゲーム', 
    description: '全5問。各問ごとに順位で得点が入ります。', 
    icon: '👁️',
    rounds: 5,
    scoringType: 'ranking-30'
  },
  { 
    id: 'game-gesture', 
    name: 'ジェスチャーゲーム', 
    description: '全6問。正解するごとに10点加算されます。', 
    icon: '🎭',
    rounds: 6,
    scoringType: 'success-10'
  },
  { 
    id: 'game-relay', 
    name: 'リレー', 
    description: '全2レース。各レースの順位で得点が入ります。', 
    icon: '🏃',
    rounds: 2,
    scoringType: 'ranking-40'
  },
];
