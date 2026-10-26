import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_APP_PASSWORD) setIsLoggedIn(true);
    else alert('Password salah!');
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=20', {
          headers: { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` }
        });
        setRepos(res.data);
      } catch (error) {
        console.error("Gagal ambil repo", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [isLoggedIn]);

  const handleDeploy = async (repoName) => {
    setStatus(prev => ({ ...prev, [repoName]: 'Memproses...' }));
    
    try {
      // Tembak Vercel API untuk deploy berdasarkan repo GitHub
      await axios.post('https://api.vercel.com/v13/deployments', {
        name: repoName,
        target: 'production',
        gitSource: {
          type: 'github',
          repo: `${import.meta.env.VITE_GITHUB_USERNAME}/${repoName}`,
          ref: 'main' // Asumsi branch utama namanya 'main'
        }
      }, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_VERCEL_TOKEN}` }
      });

      setStatus(prev => ({ ...prev, [repoName]: 'Sukses Deploy!' }));
    } catch (error) {
      console.error(error);
      setStatus(prev => ({ ...prev, [repoName]: 'Gagal Deploy' }));
    }
  };

  const bgClass = "min-h-screen bg-[#0f1115] text-white p-8 font-sans relative";

  if (!isLoggedIn) {
    return (
      <div className={`${bgClass} flex items-center justify-center`}>
        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-96">
          <h1 className="text-2xl font-semibold mb-6 text-center">DYL4N Panel</h1>
          <input type="password" placeholder="Password..." value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-4 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-white/30" />
          <button type="submit" className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition-all">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-2xl font-semibold">DYL4N Control Panel</h1>
        <button onClick={() => setIsLoggedIn(false)} className="bg-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/20">Logout</button>
      </header>
      
      <main>
        {loading ? (
          <p className="text-center text-gray-400">Menarik data dari GitHub...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div key={repo.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1 truncate">{repo.name}</h2>
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2">{repo.description || "Tidak ada deskripsi."}</p>
                </div>
                
                <div>
                  <span className="block mb-3 text-xs font-bold text-gray-400">
                    {status[repo.name] || 'Siap'}
                  </span>
                  <button 
                    onClick={() => handleDeploy(repo.name)}
                    disabled={status[repo.name] === 'Memproses...'}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-xl font-semibold transition-all disabled:bg-gray-700 disabled:text-gray-400"
                  >
                    {status[repo.name] === 'Memproses...' ? 'Deploying...' : 'Deploy Now'}
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