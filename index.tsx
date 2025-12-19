import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- 設定データ ---
const TEAMS = [
  { id: 'team-red', name: '赤チーム', color: 'bg-red-500' },
  { id: 'team-blue', name: '青チーム', color: 'bg-blue-500' },
  { id: 'team-yellow', name: '黄チーム', color: 'bg-yellow-400' },
  { id: 'team-green', name: '緑チーム', color: 'bg-green-500' },
];

const GAMES = [
  { id: 'game-dengon', name: '伝言ゲーム', icon: '🗣️', rounds: 5, type: 'ranking-30' },
  { id: 'game-visual', name: '動体視力', icon: '👁️', rounds: 5, type: 'ranking-30' },
  { id: 'game-gesture', name: 'ジェスチャー', icon: '🎭', rounds: 6, type: 'success-10' },
  { id: 'game-relay', name: 'リレー', icon: '🏃', rounds: 2, type: 'ranking-40' },
];

// --- 簡易グラフコンポーネント ---
const SimpleChart = ({ rankings }: { rankings: any[] }) => {
  const max = Math.max(...rankings.map(d => d.totalScore), 1);
  return (
    <div className="flex items-end justify-around h-40 pt-8 pb-2 px-2">
      {TEAMS.map(team => {
        const scoreData = rankings.find(r => r.teamId === team.id);
        const total = scoreData ? scoreData.totalScore : 0;
        const height = (total / max) * 100;
        return (
          <div key={team.id} className="flex flex-col items-center flex-1">
            <div className="text-[10px] font-black mb-1 text-gray-700">{total}</div>
            <div 
              className={`${team.color} w-full max-w-[24px] rounded-t-md transition-all duration-700`}
              style={{ height: `${height}%`, minHeight: '4px' }}
            ></div>
            <div className="text-[10px] mt-2 font-bold text-gray-400">{team.name.replace('チーム','')}</div>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0].id);
  const [selectedRound, setSelectedRound] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('vball_xmas_v3');
    if (saved) setScores(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('vball_xmas_v3', JSON.stringify(scores));
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

  const currentGame = GAMES.find(g => g.id === selectedGameId)!;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 flex flex-col">
      <header className="christmas-gradient text-white p-5 shadow-lg flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black opacity-70 tracking-widest">TAISEI JR VBC</p>
          <h1 className="text-xl font-black">🎄 得点表</h1>
        </div>
        <i className="fas fa-volleyball-ball text-xl opacity-50"></i>
      </header>

      <main className="p-4 max-w-md mx-auto w-full flex-grow">
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 mb-2 uppercase flex items-center gap-2">
                <i className="fas fa-chart-bar text-red-500"></i> ポイント分布
              </h2>
              <SimpleChart rankings={rankings} />
            </div>
            {rankings.map((team, i) => (
              <div key={team.teamId} className="bg-white rounded-xl p-4 flex items-center shadow-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mr-4 ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {team.rank}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-black text-gray-700">{team.teamName}</div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2">
                    <div className={`${TEAMS.find(t => t.id === team.teamId)?.color} h-full transition-all`} style={{width: `${(team.totalScore / (rankings[0].totalScore || 1)) * 100}%`}}></div>
                  </div>
                </div>
                <div className="text-xl font-black ml-4 text-gray-800">{team.totalScore}pt</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {GAMES.map(g => (
                <button key={g.id} onClick={() => {setSelectedGameId(g.id); setSelectedRound(0);}} className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${selectedGameId === g.id ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'}`}>
                  {g.icon} {g.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-800">{currentGame.name}</h3>
                <div className="flex gap-1">
                  {[...Array(currentGame.rounds)].map((_, i) => (
                    <button key={i} onClick={() => setSelectedRound(i)} className={`w-8 h-8 rounded-lg text-xs font-black ${selectedRound === i ? 'bg-green-100 text-green-700' : 'text-gray-300 bg-gray-50'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {TEAMS.map(team => {
                  const current = scores.find(s => s.teamId === team.id && s.gameId === currentGame.id && s.roundIndex === selectedRound);
                  const pts = current ? current.points : null;
                  return (
                    <div key={team.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 mb-2">{team.name}</div>
                      <div className="flex gap-1">
                        {currentGame.type.startsWith('ranking') ? (
                          [1, 2, 3, 4].map(rank => {
                            const p = currentGame.type === 'ranking-40' ? [40, 30, 20, 10][rank - 1] : [30, 20, 10, 0][rank - 1];
                            const isActive = pts === p && current;
                            return (
                              <button key={rank} onClick={() => updateScore(team.id, currentGame.id, selectedRound, p)} className={`flex-1 py-2 rounded-lg text-xs font-black border ${isActive ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200'}`}>
                                {rank}位
                              </button>
                            );
                          })
                        ) : (
                          <button onClick={() => updateScore(team.id, currentGame.id, selectedRound, pts === 10 ? 0 : 10)} className={`w-full py-2 rounded-lg text-xs font-black border ${pts === 10 ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-300 border-gray-200'}`}>
                            {pts === 10 ? '✅ 成功(10pt)' : '未達成'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="p-10 text-center">
            <button onClick={() => { if(confirm("リセットしますか？")) { setScores([]); localStorage.clear(); }}} className="bg-red-600 text-white px-8 py-4 rounded-xl font-black shadow-lg">
              データを全削除
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 z-50">
        <button onClick={() => setActiveTab('leaderboard')} className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'leaderboard' ? 'text-red-600' : 'text-gray-300'}`}>
          <i className="fas fa-trophy"></i><span className="text-[10px] font-black mt-1">順位</span>
        </button>
        <button onClick={() => setActiveTab('input')} className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'input' ? 'text-green-600' : 'text-gray-300'}`}>
          <i className="fas fa-edit"></i><span className="text-[10px] font-black mt-1">入力</span>
        </button>
        <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'admin' ? 'text-gray-800' : 'text-gray-300'}`}>
          <i className="fas fa-cog"></i><span className="text-[10px] font-black mt-1">設定</span>
        </button>
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
