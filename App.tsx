
import React, { useState, useEffect, useMemo } from 'react';

// --- 型定義 ---
interface Team {
  id: string;
  name: string;
  color: string;
  hex: string;
}

interface Game {
  id: string;
  name: string;
  icon: string;
  rounds: number;
  type: 'ranking-30' | 'ranking-40' | 'success-10';
}

interface ScoreData {
  teamId: string;
  gameId: string;
  roundIndex: number;
  points: number;
}

// --- 設定データ ---
const TEAMS: Team[] = [
  { id: 'team-red', name: '赤チーム', color: 'bg-red-500', hex: '#ef4444' },
  { id: 'team-blue', name: '青チーム', color: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'team-yellow', name: '黄チーム', color: 'bg-yellow-400', hex: '#facc15' },
  { id: 'team-green', name: '緑チーム', color: 'bg-green-500', hex: '#22c55e' },
];

const GAMES: Game[] = [
  { id: 'game-dengon', name: '伝言ゲーム', icon: '🗣️', rounds: 5, type: 'ranking-30' },
  { id: 'game-visual', name: '動体視力', icon: '👁️', rounds: 5, type: 'ranking-30' },
  { id: 'game-gesture', name: 'ジェスチャー', icon: '🎭', rounds: 6, type: 'success-10' },
  { id: 'game-relay', name: 'リレー', icon: '🏃', rounds: 2, type: 'ranking-40' },
];

// --- 自作グラフコンポーネント (外部ライブラリ不要) ---
const SimpleChart = ({ data }: { data: any[] }) => {
  const max = Math.max(...data.map(d => d.totalScore), 1);
  return (
    <div className="flex items-end justify-around h-40 pt-8 pb-2">
      {data.map(d => {
        const team = TEAMS.find(t => t.id === d.teamId);
        return (
          <div key={d.teamId} className="flex flex-col items-center flex-1">
            <div className="text-[10px] font-black mb-1 text-gray-700">{d.totalScore}</div>
            <div 
              className={`${team?.color} w-full max-w-[32px] rounded-t-lg transition-all duration-700`}
              style={{ height: `${(d.totalScore / max) * 100}%`, minHeight: '4px' }}
            ></div>
            <div className="text-[10px] mt-2 font-bold text-gray-400">{team?.name.replace('チーム', '')}</div>
          </div>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'input' | 'admin'>('leaderboard');
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES[0].id);
  const [selectedRound, setSelectedRound] = useState<number>(0);

  // データ保存・読み込み
  useEffect(() => {
    const saved = localStorage.getItem('vball_xmas_vFinal_v2');
    if (saved) {
      try {
        setScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load scores", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vball_xmas_vFinal_v2', JSON.stringify(scores));
  }, [scores]);

  const rankings = useMemo(() => {
    const totals = TEAMS.map(team => {
      const total = scores
        .filter(s => s.teamId === team.id)
        .reduce((sum, s) => sum + s.points, 0);
      return { teamId: team.id, teamName: team.name, totalScore: total };
    });
    return totals.sort((a, b) => b.totalScore - a.totalScore).map((t, i) => ({ ...t, rank: i + 1 }));
  }, [scores]);

  const updateScore = (teamId: string, gameId: string, roundIdx: number, pts: number) => {
    setScores(prev => {
      const filtered = prev.filter(s => !(s.teamId === teamId && s.gameId === gameId && s.roundIndex === roundIdx));
      return [...filtered, { teamId, gameId, roundIndex: roundIdx, points: pts }];
    });
  };

  const resetScores = () => {
    if (confirm("全ての得点をリセットしてもよろしいですか？")) {
      setScores([]);
      localStorage.removeItem('vball_xmas_vFinal_v2');
    }
  };

  const currentGame = GAMES.find(g => g.id === selectedGameId)!;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 flex flex-col font-sans">
      {/* ヘッダー */}
      <header className="christmas-gradient text-white p-5 shadow-lg flex justify-between items-center shrink-0">
        <div>
          <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Taisei Junior VBC</p>
          <h1 className="text-xl font-black flex items-center gap-2">🎄 クリスマス得点表</h1>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <i className="fas fa-volleyball-ball text-xl"></i>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto w-full flex-grow overflow-y-auto">
        {/* 順位表 */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 mb-2 uppercase flex items-center gap-2 tracking-tighter">
                <i className="fas fa-chart-bar text-red-500"></i> 現在のポイント分布
              </h2>
              <SimpleChart data={rankings} />
            </div>
            
            <div className="space-y-2">
              {rankings.map((team, i) => {
                const teamData = TEAMS.find(t => t.id === team.teamId)!;
                return (
                  <div key={team.teamId} className="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 transition-all active:scale-95">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mr-4 text-xs ${i === 0 ? 'bg-yellow-400 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                      {team.rank}
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-black text-gray-700">{team.teamName}</div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`${teamData.color} h-full transition-all duration-1000`} 
                          style={{width: `${(team.totalScore / (rankings[0].totalScore || 1)) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xl font-black ml-4 text-gray-800 leading-none">
                      {team.totalScore}<span className="text-[10px] ml-0.5 opacity-50">pt</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 得点入力 */}
        {activeTab === 'input' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {GAMES.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => {setSelectedGameId(g.id); setSelectedRound(0);}} 
                  className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${selectedGameId === g.id ? 'bg-green-600 text-white shadow-md ring-2 ring-green-100' : 'bg-white text-gray-400 border border-gray-200'}`}
                >
                  {g.icon} {g.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                   <span className="text-xl">{currentGame.icon}</span>
                   {currentGame.name}
                </h3>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {[...Array(currentGame.rounds)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedRound(i)} 
                      className={`w-8 h-8 rounded-md text-[10px] font-black transition-all ${selectedRound === i ? 'bg-white text-green-700 shadow-sm scale-110' : 'text-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {TEAMS.map(team => {
                  const current = scores.find(s => s.teamId === team.id && s.gameId === currentGame.id && s.roundIndex === selectedRound);
                  const pts = current ? current.points : null;

                  return (
                    <div key={team.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 mb-2 flex items-center gap-1.5 uppercase">
                        <div className={`w-1.5 h-1.5 rounded-full ${team.color}`}></div> {team.name}
                      </div>
                      <div className="flex gap-1.5">
                        {currentGame.type.startsWith('ranking') ? (
                          [1, 2, 3, 4].map(rank => {
                            const p = currentGame.type === 'ranking-40' ? [40, 30, 20, 10][rank - 1] : [30, 20, 10, 0][rank - 1];
                            const isActive = pts === p && current;
                            return (
                              <button 
                                key={rank} 
                                onClick={() => updateScore(team.id, currentGame.id, selectedRound, p)} 
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${isActive ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}
                              >
                                {rank}位
                              </button>
                            );
                          })
                        ) : (
                          <button 
                            onClick={() => updateScore(team.id, currentGame.id, selectedRound, pts === 10 ? 0 : 10)} 
                            className={`w-full py-2.5 rounded-lg text-xs font-black border flex items-center justify-center gap-2 transition-all ${pts === 10 ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-300 border-gray-200'}`}
                          >
                            <i className={pts === 10 ? "fas fa-check-circle" : "far fa-circle"}></i>
                            {pts === 10 ? '正解済み (10pt)' : '未達成 / 失敗'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
               <div className="text-2xl">💡</div>
               <p className="text-[10px] font-bold text-blue-700 leading-relaxed italic">
                 「{selectedRound + 1}問目」の得点。入力を変えると自動で保存されます。
               </p>
            </div>
          </div>
        )}

        {/* 設定 */}
        {activeTab === 'admin' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash-alt text-2xl"></i>
              </div>
              <h3 className="font-black text-gray-800 mb-2">全データリセット</h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed px-4">入力したすべての得点を消去します。大会を新しく始める時に使用してください。</p>
              <button 
                onClick={resetScores} 
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                データを初期化する
              </button>
            </div>

            <div className="text-center text-[10px] font-bold text-gray-300 py-4 uppercase tracking-widest">
              Taisei Jr Volleyball Club &copy; 2024
            </div>
          </div>
        )}
      </main>

      {/* 固定ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveTab('leaderboard')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all ${activeTab === 'leaderboard' ? 'text-red-600' : 'text-gray-300'}`}
        >
          <i className={`fas fa-trophy text-lg ${activeTab === 'leaderboard' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-black mt-1">順位表</span>
        </button>
        <button 
          onClick={() => setActiveTab('input')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all ${activeTab === 'input' ? 'text-green-600' : 'text-gray-300'}`}
        >
          <i className={`fas fa-edit text-lg ${activeTab === 'input' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-black mt-1">得点入力</span>
        </button>
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all ${activeTab === 'admin' ? 'text-gray-800' : 'text-gray-300'}`}
        >
          <i className={`fas fa-cog text-lg ${activeTab === 'admin' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-black mt-1">設定</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
