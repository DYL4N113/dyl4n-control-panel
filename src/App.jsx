import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState({});

const handleLogin = (e) => {
  e.preventDefault();
  if (password === import.meta.env.VITE_APP_PASSWORD) {
    setIsLoggedIn(true);
  } else {
    alert('Password salah, King!');
  }
};

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=10', {
          headers: { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` }
        });
        setRepos(response.data);
      } catch (error) {
        console.error("Gagal narik repo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [isLoggedIn]);

  const handleDeploy = async (repoName) => {
    setDeployStatus(prev => ({ ...prev, [repoName]: 'Building...' }));
    try {
      const response = await axios.post(import.meta.env.VITE_VERCEL_HOOK);
      if (response.status === 200 || response.status === 201) {
        setDeployStatus(prev => ({ ...prev, [repoName]: 'Success!' }));
      } else {
        setDeployStatus(prev => ({ ...prev, [repoName]: 'Gagal' }));
      }
    } catch (error) {
      setDeployStatus(prev => ({ ...prev, [repoName]: 'Error' }));
    }
  };

  // Background statis warna abu-abu gelap kebiruan
  const bgClass = "min-h-screen bg-[#0f1115] text-white p-8 font-sans overflow-hidden relative";

  if (!isLoggedIn) {
    return (
      <div className={`${bgClass} flex items-center justify-center`}>
        <form onSubmit={handleLogin} className="glass-panel p-8 w-96 flex flex-col gap-5">
          <h1 className="text-2xl font-semibold mb-2 text-center text-white/90 tracking-wide font-sans">DYL4N Panel</h1>
          <input 
            type="password" 
            placeholder="Password..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/30 text-white placeholder-white/30 transition-all font-sans"
          />
          <button type="submit" className="w-full glass-btn text-white font-semibold py-3 rounded-2xl font-sans">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      {/* Background Ornamen Halus */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="relative z-10 mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90">Control Panel</h1>
        <button onClick={() => setIsLoggedIn(false)} className="glass-btn px-5 py-2 rounded-full text-sm text-white/80">
          Logout
        </button>
      </header>
      
      <main className="relative z-10">
        {loading ? (
          <p className="text-center text-white/50 animate-pulse font-sans">Menarik data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div key={repo.id} className="glass-panel p-6 flex flex-col justify-between h-full">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-1 text-white/90 truncate font-sans">{repo.name}</h2>
                  <p className="text-white/40 text-xs line-clamp-2 font-sans">{repo.description || "Tidak ada deskripsi."}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className={`text-[11px] tracking-wide font-bold px-3 py-1.5 rounded-full uppercase font-sans ${
                      deployStatus[repo.name] === 'Success!' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      deployStatus[repo.name] === 'Error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      deployStatus[repo.name] === 'Building...' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-white/5 text-white/40 border border-white/5'
                    }`}>
                      {deployStatus[repo.name] || 'Idle'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeploy(repo.name)}
                    disabled={deployStatus[repo.name] === 'Building...'}
                    className={`w-full font-semibold py-2.5 rounded-2xl transition-all font-sans ${
                      deployStatus[repo.name] === 'Building...' 
                      ? 'bg-white/5 cursor-not-allowed text-white/20' 
                      : 'glass-btn text-white'
                    }`}
                  >
                    {deployStatus[repo.name] === 'Building...' ? 'Deploying...' : 'Deploy Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;