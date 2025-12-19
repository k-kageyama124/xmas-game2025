import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- 設定データ ---
const TEAMS = [
  { id: 'team-red', name: '赤チーム', color: 'bg-red-500', hex: '#ef4444' },
  { id: 'team-blue', name: '青チーム', color: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'team-yellow', name: '黄チーム', color: 'bg-yellow-400', hex: '#facc15' },
  { id: 'team-green', name: '緑チーム', color: 'bg-green-500', hex: '#22c55e' },
];

const GAMES = [
  { id: 'game-dengon', name: '伝言ゲーム', icon: '🗣️', rounds: 5, type: 'ranking-30' },
  { id: 'game-visual', name: '動体視力', icon: '👁️', rounds: 5, type: 'ranking-30' },
  { id: 'game-gesture', name: 'ジェスチャー', icon: '🎭', rounds: 6, type: 'success-10' },
  { id: 'game-relay', name: 'リレー', icon: '🏃', rounds: 2, type: 'ranking-40' },
];

// --- 順位表のバーグラフ ---
const RankingChart = ({ rankings }: { rankings: any[] }) => {
  const max = Math.max(...rankings.map(d => d.totalScore), 1);
  return (
    <div className="flex items-end justify-around h-32 pt-6 pb-2 px-4 bg-white/50 rounded-xl">
      {TEAMS.map(team => {
        const score = rankings.find(r => r.teamId === team.id)?.totalScore || 0;
        const height = (score / max) * 100;
        return (
          <div key={team.id} className="flex flex-col items-center flex-1">
            <div className="text-[10px] font-black mb-1 text-gray-800">{score}</div>
            <div 
              className={`${team.color} w-full max-w-[20px] rounded-t-sm shadow-sm transition-all duration-1000 ease-out`}
              style={{ height: `${height}%`, minHeight: '4px' }}
            ></div>
            <div className="text-[9px] mt-2 font-bold text-gray-500">{team.name.replace('チーム','')}</div>
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
    const saved = localStorage.getItem('oonari_vbc_xmas_final_v2');
    if (saved) setScores(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('oonari_vbc_xmas_final_v2', JSON.stringify(scores));
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
    <div className="min-h-screen pb-24 flex flex-col">
      {/* ヘッダー：クラブ名を「おおなり」に修正 */}
      <header className="christmas-gradient text-white p-6 shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-[-10px] right-[-10px] text-white/10 text-8xl rotate-12 animate-bounce-subtle">🎄</div>
        <div className="relative z-10">
          <p className="text-[10px] font-black opacity-80 tracking-widest mb-1 uppercase">OONARI JR VOLLEYBALL CLUB</p>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span className="text-3xl">🎅</span> おおなり クリスマス会
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto w-full flex-grow">
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-red-50">
              <h2 className="text-xs font-black text-red-600 mb-3 uppercase flex items-center gap-2">
                <i className="fas fa-crown"></i> リアルタイム・ランキング
              </h2>
              <RankingChart rankings={rankings} />
            </div>

            <div className="space-y-3">
              {rankings.map((team, i) => {
                const teamInfo = TEAMS.find(t => t.id === team.teamId)!;
                return (
                  <div key={team.teamId} className="bg-white rounded-2xl p-4 flex items-center shadow-sm border border-gray-100 transition-transform active:scale-95">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black mr-4 text-lg ${i === 0 ? 'bg-yellow-400 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400'}`}>
                      {team.rank}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-black text-gray-700">{team.teamName}</div>
                      <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`${teamInfo.color} h-full transition-all duration-1000`} 
                          style={{width: `${(team.totalScore / (rankings[0].totalScore || 1)) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="text-2xl font-black ml-4 text-gray-800">
                      {team.totalScore}<span className="text-xs ml-1 opacity-40">pt</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
              {GAMES.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => {setSelectedGameId(g.id); setSelectedRound(0);}} 
                  className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${selectedGameId === g.id ? 'bg-red-600 text-white shadow-red-200 ring-4 ring-red-100' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                  {g.icon} {g.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50">
              <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                  <span className="text-2xl">{currentGame.icon}</span> {currentGame.name}
                </h3>
                <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-xl">
                  {[...Array(currentGame.rounds)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedRound(i)} 
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${selectedRound === i ? 'bg-white text-red-600 shadow-md scale-110 ring-1 ring-gray-100' : 'text-gray-300'}`}
                    >
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
                    <div key={team.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50">
                      <div className="text-[10px] font-black text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <div className={`w-2 h-2 rounded-full ${team.color}`}></div> {team.name}
                      </div>
                      <div className="flex gap-2">
                        {currentGame.type.startsWith('ranking') ? (
                          [1, 2, 3, 4].map(rank => {
                            const p = currentGame.type === 'ranking-40' ? [40, 30, 20, 10][rank - 1] : [30, 20, 10, 0][rank - 1];
                            const isActive = pts === p && current;
                            return (
                              <button 
                                key={rank} 
                                onClick={() => updateScore(team.id, currentGame.id, selectedRound, p)} 
                                className={`flex-1 py-3 rounded-xl text-xs font-black border-2 transition-all ${isActive ? 'bg-gray-800 text-white border-gray-800 shadow-lg' : 'bg-white text-gray-400 border-gray-100 active:bg-gray-100'}`}
                              >
                                {rank}位
                              </button>
                            );
                          })
                        ) : (
                          <button 
                            onClick={() => updateScore(team.id, currentGame.id, selectedRound, pts === 10 ? 0 : 10)} 
                            className={`w-full py-4 rounded-xl text-sm font-black border-2 flex items-center justify-center gap-3 transition-all ${pts === 10 ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-gray-300 border-gray-100 active:bg-gray-100'}`}
                          >
                            <i className={pts === 10 ? "fas fa-check-circle text-xl" : "far fa-circle text-xl"}></i>
                            {pts === 10 ? '正解済み (+10pt)' : '未達成 / 挑戦中'}
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
          <div className="space-y-6 pt-10 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trash-alt text-3xl"></i>
            </div>
            <div className="px-6">
              <h3 className="font-black text-gray-800 text-lg mb-2">得点のリセット</h3>
              <p className="text-xs text-gray-400 leading-relaxed">これまでに記録したすべての得点が消去されます。</p>
            </div>
            <button 
              onClick={() => { if(confirm("本当にリセットしますか？")) { setScores([]); localStorage.clear(); setActiveTab('leaderboard'); }}} 
              className="mx-6 px-10 py-5 bg-red-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all"
            >
              全データをリセット
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white rounded-3xl flex items-center justify-center p-2 z-50 shadow-2xl w-[90%] max-sm:max-w-[320px]">
        <button 
          onClick={() => setActiveTab('leaderboard')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all rounded-2xl ${activeTab === 'leaderboard' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-300'}`}
        >
          <i className="fas fa-trophy text-lg"></i>
          <span className="text-[9px] font-black mt-1">順位</span>
        </button>
        <button 
          onClick={() => setActiveTab('input')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all rounded-2xl ${activeTab === 'input' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-300'}`}
        >
          <i className="fas fa-edit text-lg"></i>
          <span className="text-[9px] font-black mt-1">入力</span>
        </button>
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`flex flex-col items-center p-3 flex-1 transition-all rounded-2xl ${activeTab === 'admin' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-300'}`}
        >
          <i className="fas fa-cog text-lg"></i>
          <span className="text-[9px] font-black mt-1">設定</span>
        </button>
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
