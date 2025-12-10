import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Clock, 
  Settings, 
  BookOpen, 
  Backpack, 
  Zap, 
  Upload, 
  Download, 
  Moon, 
  Sun,
  Star,
  ArrowUpCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { POKEMON_DB } from './data';
import { AppData, PokemonSpecies, OwnedPokemon, TradeRecord } from './types';

// --- Constants ---
const COIN_CATCH_COST = 3;
const COIN_EVOLVE_COST = 2;
const COIN_TRADE_VALUE = 1;

const EVOLUTION_BURST_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png";

const INITIAL_DATA: AppData = {
  coins: 0,
  totalStudyHours: 0,
  ownedPokemon: [],
  seenPokemon: [],
  trades: [],
  settings: {
    dailyTarget: 3,
    themeColor: '#3b82f6', // Tailwind blue-500
    scale: 1,
    darkMode: false,
  },
  lastLoginDate: new Date().toISOString().split('T')[0],
};

// --- Helper Functions ---
const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isBeforeNoon = (date: Date) => date.getHours() < 12;

// --- Components ---

const App: React.FC = () => {
  // State
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('studyDexData');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dex' | 'pokemon' | 'settings'>('dashboard');
  const [inputHours, setInputHours] = useState<string>('');
  
  // Animation States
  const [animatingCoins, setAnimatingCoins] = useState<number | null>(null);
  const [catchAnimation, setCatchAnimation] = useState<PokemonSpecies | null>(null);
  const [evolveAnimation, setEvolveAnimation] = useState<{from: PokemonSpecies, to: PokemonSpecies} | null>(null);

  // Selection Modal State
  const [evolutionSelection, setEvolutionSelection] = useState<{
    instanceId: string;
    fromSpecies: PokemonSpecies;
    options: PokemonSpecies[];
  } | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('studyDexData', JSON.stringify(data));
  }, [data]);

  // Computed Styles
  const themeStyle = {
    '--theme-color': data.settings.themeColor,
    transform: `scale(${data.settings.scale})`,
    transformOrigin: 'center',
  } as React.CSSProperties;

  const bgClass = data.settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900';
  const cardClass = data.settings.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const inputClass = data.settings.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  // --- Actions ---

  const handleAddHours = () => {
    const hours = parseFloat(inputHours);
    if (isNaN(hours) || hours <= 0) return;

    setAnimatingCoins(hours); // Trigger visual feedback
    setTimeout(() => setAnimatingCoins(null), 2000);

    setData(prev => ({
      ...prev,
      coins: prev.coins + hours,
      totalStudyHours: prev.totalStudyHours + hours
    }));
    setInputHours('');
  };

  const handleCatch = () => {
    if (data.coins < COIN_CATCH_COST) {
      alert("Not enough study coins!");
      return;
    }

    const catchablePool = POKEMON_DB; 
    const ownedIds = new Set(data.ownedPokemon.map(op => op.speciesId));
    
    const weightedPool: PokemonSpecies[] = [];
    catchablePool.forEach(p => {
        if (!ownedIds.has(p.id)) {
            for (let i = 0; i < 10; i++) weightedPool.push(p);
        } else {
            weightedPool.push(p);
        }
    });

    const randomMon = weightedPool[Math.floor(Math.random() * weightedPool.length)];

    setCatchAnimation(randomMon);

    setTimeout(() => {
      setData(prev => {
        const newOwned: OwnedPokemon = {
          instanceId: crypto.randomUUID(),
          speciesId: randomMon.id,
          isFavorite: false,
          caughtAt: new Date().toISOString()
        };
        const seen = new Set(prev.seenPokemon);
        seen.add(randomMon.id);

        return {
          ...prev,
          coins: prev.coins - COIN_CATCH_COST,
          ownedPokemon: [...prev.ownedPokemon, newOwned],
          seenPokemon: Array.from(seen)
        };
      });
      setCatchAnimation(null);
    }, 2500);
  };

  const handleEvolve = (instanceId: string) => {
    if (data.coins < COIN_EVOLVE_COST) {
        alert("Not enough coins to evolve!");
        return;
    }

    const pokemonToEvolve = data.ownedPokemon.find(p => p.instanceId === instanceId);
    if (!pokemonToEvolve) return;

    const species = POKEMON_DB.find(s => s.id === pokemonToEvolve.speciesId);
    if (!species) return;

    // Check for Branching Evolution
    if (species.branchEvolutions && species.branchEvolutions.length > 0) {
      const options = species.branchEvolutions
        .map(id => POKEMON_DB.find(p => p.id === id))
        .filter((p): p is PokemonSpecies => !!p);
      
      if (options.length > 0) {
        setEvolutionSelection({
          instanceId,
          fromSpecies: species,
          options
        });
        return;
      }
    }

    // Standard Evolution
    if (!species.evolutionId) {
       alert("This Pokemon cannot evolve further.");
       return;
    }

    const evolvedSpecies = POKEMON_DB.find(s => s.id === species.evolutionId);
    if (!evolvedSpecies) return;

    confirmEvolution(instanceId, species, evolvedSpecies);
  };

  const confirmEvolution = (instanceId: string, fromSpecies: PokemonSpecies, toSpecies: PokemonSpecies) => {
    setEvolutionSelection(null);
    setEvolveAnimation({ from: fromSpecies, to: toSpecies });

    setTimeout(() => {
        setData(prev => {
            const updatedOwned = prev.ownedPokemon.map(p => {
                if (p.instanceId === instanceId) {
                    return { ...p, speciesId: toSpecies.id };
                }
                return p;
            });

            const seen = new Set(prev.seenPokemon);
            seen.add(toSpecies.id);

            return {
                ...prev,
                coins: prev.coins - COIN_EVOLVE_COST,
                ownedPokemon: updatedOwned,
                seenPokemon: Array.from(seen)
            };
        });
        setEvolveAnimation(null);
    }, 3000);
  };

  const handleTrade = (instanceId: string) => {
    const now = new Date();
    const isMorning = isBeforeNoon(now);

    const todayTrades = data.trades.filter(t => {
      const tDate = new Date(t.timestamp);
      return tDate.toDateString() === now.toDateString();
    });

    const hasTradedMorning = todayTrades.some(t => isBeforeNoon(new Date(t.timestamp)));
    const hasTradedAfternoon = todayTrades.some(t => !isBeforeNoon(new Date(t.timestamp)));

    if (isMorning && hasTradedMorning) {
      alert("You have already traded a Pokemon this morning (before 12PM).");
      return;
    }
    if (!isMorning && hasTradedAfternoon) {
      alert("You have already traded a Pokemon this afternoon/evening (after 12PM).");
      return;
    }

    if (!confirm("Are you sure? You will lose this Pokemon forever in exchange for 1 Coin.")) return;

    setData(prev => ({
      ...prev,
      coins: prev.coins + COIN_TRADE_VALUE,
      ownedPokemon: prev.ownedPokemon.filter(p => p.instanceId !== instanceId),
      trades: [...prev.trades, { timestamp: now.getTime() }]
    }));
  };

  const toggleFavorite = (instanceId: string) => {
    setData(prev => ({
      ...prev,
      ownedPokemon: prev.ownedPokemon.map(p => 
        p.instanceId === instanceId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    }));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-dex-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setData(parsed);
        alert("Data loaded successfully!");
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // --- Sub-Views ---

  const renderDashboard = () => {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className={`p-6 rounded-2xl shadow-lg ${cardClass} border-2 relative overflow-hidden`}>
           {/* Decorative Background Circles */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--theme-color)] opacity-10 rounded-full"></div>
           <div className="absolute top-20 -left-10 w-20 h-20 bg-[var(--theme-color)] opacity-10 rounded-full"></div>

           <div className="relative z-10 text-center">
             <h2 className="text-3xl font-bold font-pixel mb-2" style={{ color: data.settings.themeColor }}>
               {data.coins.toFixed(1)} <span className="text-sm text-gray-500 font-sans">Coins</span>
             </h2>
             <p className={`text-sm mb-6 ${data.settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
               Study 1 hour to earn 1 Coin.
             </p>

             <div className="flex items-center gap-2 justify-center mb-6">
                <input 
                  type="number" 
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  placeholder="Hours..."
                  className={`w-40 p-3 rounded-lg border-2 focus:ring-2 focus:ring-[var(--theme-color)] outline-none text-center text-lg font-bold transition-all ${inputClass}`}
                />
                <button 
                  onClick={handleAddHours}
                  className="p-3 rounded-lg text-white font-bold shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                  style={{ backgroundColor: data.settings.themeColor }}
                >
                  <Clock size={20} />
                  Log
                </button>
             </div>
             
             <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                <div 
                  className="h-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(100, (data.coins / data.settings.dailyTarget) * 100)}%`, 
                    backgroundColor: data.settings.themeColor 
                  }}
                />
             </div>
             <p className="mt-2 text-xs text-gray-400 font-mono">Daily Target: {data.settings.dailyTarget} hrs</p>
           </div>

           {animatingCoins && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-float">
               <span className="text-4xl font-bold text-yellow-400 drop-shadow-md font-pixel">+{animatingCoins}</span>
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
             onClick={handleCatch}
             className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 hover:bg-opacity-90 transition-all ${data.coins < COIN_CATCH_COST ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-md'}`}
             style={{ borderColor: data.settings.themeColor, backgroundColor: data.settings.darkMode ? '#1e293b' : 'white' }}
          >
             <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 text-red-500">
               <div className="w-8 h-8 rounded-full border-4 border-red-500 bg-white relative overflow-hidden">
                 <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500 -mt-0.5"></div>
                 <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border-2 border-red-500 rounded-full -ml-1.5 -mt-1.5"></div>
               </div>
             </div>
             <span className="font-bold">Catch New</span>
             <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-mono">-{COIN_CATCH_COST} Coins</span>
          </button>

          <button 
             onClick={() => setActiveTab('pokemon')}
             className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 hover:scale-105 shadow-md transition-all`}
             style={{ borderColor: data.settings.themeColor, backgroundColor: data.settings.darkMode ? '#1e293b' : 'white' }}
          >
             <Backpack size={32} style={{ color: data.settings.themeColor }} />
             <span className="font-bold">Inventory</span>
             <span className="text-xs text-gray-400 font-mono">{data.ownedPokemon.length} Owned</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDex = () => {
    const sortedDex = [...POKEMON_DB].sort((a, b) => {
        if (a.familyId === b.familyId) {
            return a.id - b.id;
        }
        return a.familyId - b.familyId;
    });

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pb-4">
        {sortedDex.map(pokemon => {
          const isCaught = data.seenPokemon.includes(pokemon.id);
          return (
            <div key={pokemon.id} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative p-1 ${cardClass} ${isCaught ? '' : 'bg-gray-100 dark:bg-slate-800'}`}>
               <span className="absolute top-1 left-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono z-10">#{String(pokemon.id).padStart(3, '0')}</span>
               <img 
                 src={pokemon.sprite} 
                 loading="lazy"
                 alt={pokemon.name}
                 className={`w-full h-full object-contain pixelated transition-all duration-500 ${isCaught ? 'filter-none drop-shadow-md' : 'brightness-0 opacity-60 dark:invert dark:opacity-50'}`}
               />
               {isCaught && <span className="text-[9px] font-bold mt-1 truncate w-full text-center">{pokemon.name}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInventory = () => {
    const sortedOwned = [...data.ownedPokemon].sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return a.speciesId - b.speciesId;
        return a.isFavorite ? -1 : 1;
    });

    if (sortedOwned.length === 0) {
        return <div className="text-center py-20 text-gray-400">No Pokémon caught yet. Start studying!</div>;
    }

    return (
      <div className="grid gap-4">
        {sortedOwned.map(owned => {
          const species = POKEMON_DB.find(p => p.id === owned.speciesId)!;
          if (!species) return null;
          
          const canEvolve = (!!species.evolutionId || (species.branchEvolutions && species.branchEvolutions.length > 0)) && data.coins >= COIN_EVOLVE_COST;
          
          return (
            <div key={owned.instanceId} className={`flex items-center p-3 rounded-xl border-2 shadow-sm gap-4 ${cardClass}`}>
               <div className="relative">
                 <img src={species.sprite} className="w-16 h-16 pixelated" alt={species.name} />
                 {owned.isFavorite && <Star className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400 w-4 h-4" />}
               </div>
               
               <div className="flex-1">
                 <h3 className="font-bold flex items-center gap-2">
                    {species.name}
                    <button onClick={() => toggleFavorite(owned.instanceId)} className="opacity-30 hover:opacity-100">
                        <Star size={14} />
                    </button>
                 </h3>
                 <p className="text-xs text-gray-500">Caught: {new Date(owned.caughtAt).toLocaleDateString()}</p>
                 <div className="flex gap-2 mt-2">
                   {canEvolve && (
                     <button 
                        onClick={() => handleEvolve(owned.instanceId)}
                        className={`text-xs px-2 py-1 rounded border flex items-center gap-1 bg-green-100 text-green-700 border-green-300 hover:bg-green-200`}
                     >
                       <ArrowUpCircle size={12} /> Evolve (2c)
                     </button>
                   )}
                   <button 
                      onClick={() => handleTrade(owned.instanceId)}
                      className="text-xs px-2 py-1 rounded border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 flex items-center gap-1"
                   >
                     <RefreshCw size={12} /> Trade (1c)
                   </button>
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSettings = () => (
    <div className={`p-6 rounded-2xl ${cardClass} space-y-8`}>
        <section>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20} /> General</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span>Daily Target (Hours)</span>
                    <input 
                      type="number" 
                      className={`w-20 p-2 rounded border text-center ${inputClass}`}
                      value={data.settings.dailyTarget}
                      onChange={(e) => setData({...data, settings: {...data.settings, dailyTarget: Number(e.target.value)}})}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <button 
                      onClick={() => setData({...data, settings: {...data.settings, darkMode: !data.settings.darkMode}})}
                      className={`p-2 rounded-lg border ${data.settings.darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-slate-600'}`}
                    >
                        {data.settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </section>

        <section>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap size={20} /> Appearance</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm mb-2">Interface Scale</label>
                    <input 
                       type="range" min="0.8" max="1.2" step="0.05"
                       value={data.settings.scale}
                       onChange={(e) => setData({...data, settings: {...data.settings, scale: Number(e.target.value)}})}
                       className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-2">Theme Color</label>
                    <div className="flex gap-3">
                        {['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b'].map(c => (
                            <button 
                              key={c}
                              className={`w-8 h-8 rounded-full border-2 ${data.settings.themeColor === c ? 'border-black dark:border-white scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                              onClick={() => setData({...data, settings: {...data.settings, themeColor: c}})}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Upload size={20} /> Data</h3>
            <div className="flex gap-4">
                <button onClick={exportData} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                    <Download size={16} /> Export
                </button>
                <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2 cursor-pointer">
                    <Upload size={16} /> Import
                    <input type="file" className="hidden" accept=".json" onChange={importData} />
                </label>
            </div>
        </section>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex justify-center ${bgClass}`} style={themeStyle}>
      <div className="w-full max-w-2xl h-full flex flex-col relative shadow-xl">
        
        {/* Header */}
        <header className="flex-none p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 z-20 bg-opacity-95 bg-inherit">
           <h1 className="font-pixel text-xl flex items-center gap-2" style={{ color: data.settings.themeColor }}>
             <span className="text-2xl">⚡</span> StudyDex
           </h1>
           <div className="text-xs font-mono opacity-60">
             {data.coins} Coins
           </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'dex' && renderDex()}
            {activeTab === 'pokemon' && renderInventory()}
            {activeTab === 'settings' && renderSettings()}
        </main>

        {/* Navigation - Static in Flex Layout */}
        <nav className={`flex-none p-2 border-t z-30 ${data.settings.darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
           <div className="max-w-2xl mx-auto flex justify-around">
              {[
                { id: 'dashboard', icon: Clock, label: 'Study' },
                { id: 'dex', icon: BookOpen, label: 'Dex' },
                { id: 'pokemon', icon: Backpack, label: 'Pkmn' },
                { id: 'settings', icon: Settings, label: 'Set' },
              ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${activeTab === tab.id ? 'scale-110 font-bold' : 'opacity-60 hover:opacity-100'}`}
                    style={{ color: activeTab === tab.id ? data.settings.themeColor : 'inherit' }}
                  >
                     <tab.icon size={24} />
                     <span className="text-[10px] mt-1">{tab.label}</span>
                  </button>
              ))}
           </div>
        </nav>

        {/* Evolution Selection Modal */}
        {evolutionSelection && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
                <div className={`w-full max-w-sm rounded-2xl p-6 ${cardClass} relative`}>
                    <button 
                        onClick={() => setEvolutionSelection(null)}
                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="font-bold text-center mb-6 font-pixel text-lg">Evolve {evolutionSelection.fromSpecies.name}?</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {evolutionSelection.options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => confirmEvolution(evolutionSelection.instanceId, evolutionSelection.fromSpecies, opt)}
                                className="flex flex-col items-center p-4 rounded-xl border-2 hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 transition-all"
                                style={{ borderColor: data.settings.themeColor }}
                            >
                                <img src={opt.sprite} className="w-16 h-16 pixelated mb-2" alt={opt.name} />
                                <span className="font-bold text-xs">{opt.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Full Screen Animations */}
        {catchAnimation && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="text-white font-pixel text-2xl mb-8 animate-bounce">Gotcha!</div>
                <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                    <img 
                        src={catchAnimation.sprite} 
                        className="w-full h-full object-contain pixelated animate-shake"
                        alt="Caught"
                    />
                </div>
                <div className="mt-8 text-yellow-400 font-bold text-xl font-pixel">
                    {catchAnimation.name} was caught!
                </div>
            </div>
        )}

        {evolveAnimation && (
             <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
                 <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Evolution Effect Overlay */}
                    <div className="absolute inset-0 z-10 animate-spin flex items-center justify-center opacity-90 pointer-events-none">
                       <img src={EVOLUTION_BURST_SPRITE} className="w-full h-full object-contain animate-pulse" alt="energy" />
                    </div>
                    
                    {/* Flashing effect */}
                    <img 
                        src={evolveAnimation.from.sprite} 
                        className="absolute inset-0 w-full h-full object-contain pixelated animate-flash" 
                        style={{ animationDuration: '0.5s' }}
                    />
                    <img 
                        src={evolveAnimation.to.sprite} 
                        className="absolute inset-0 w-full h-full object-contain pixelated animate-in zoom-in duration-[3000ms]" 
                        style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
                    />
                 </div>
                 <h2 className="mt-12 text-2xl font-bold font-pixel text-slate-800 animate-pulse text-center">
                     What? {evolveAnimation.from.name} is evolving!
                 </h2>
             </div>
        )}

      </div>
    </div>
  );
};

export default App;