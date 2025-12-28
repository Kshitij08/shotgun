import React, { useState, useEffect, useRef } from 'react';
import { 
  Skull, 
  User,
  Zap, 
  Hand, 
  Eye, 
  Scissors, 
  Beer, 
  Cigarette, 
  Info,
  Settings,
  Volume2,
  VolumeX, 
  Maximize,
  Package,
  Search,
  Lock,
  Ban,
  SkipForward,
  Wallet,
  TrendingUp,
  ArrowRight,
  Swords, 
  Trophy, 
  HelpCircle
} from 'lucide-react';

// Custom Saw Icon Component
const SawIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ transform: 'rotate(-45deg)' }} 
  >
    <path d="M2 7a2 2 0 0 1 2-2h2v14H4a2 2 0 0 1-2-2V7z" />
    <path d="M6 6L23 9V17L19.5 15L16 17L12.5 15L9 17L6 15V6Z" />
    <circle cx="4" cy="12" r="1" fill="currentColor" className="opacity-50" />
  </svg>
);

// Custom Skip Icon
const SkipIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

// Custom Discord Icon (Official Shape)
const DiscordIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
  </svg>
);

// Custom X (Twitter) Icon
const XIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- DEALER EYES COMPONENT ---
const DealerEyes = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPos = (eyeOffsetX) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + eyeOffsetX;
    const centerY = rect.top + rect.height / 2;

    const deltaX = mousePos.x - centerX;
    const deltaY = mousePos.y - centerY;
    
    const angle = Math.atan2(deltaY, deltaX);
    // Movement range for the eyes themselves
    const maxDist = 40; 
    const distance = Math.min(Math.hypot(deltaX, deltaY) / 20, maxDist);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const leftPupil = calculatePupilPos(-150);
  const rightPupil = calculatePupilPos(150);

  return (
    <div ref={containerRef} className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-64 z-0 pointer-events-none mix-blend-screen animate-in fade-in duration-2000">
       {/* Left Eye Wrapper - Handles Mouse Movement */}
       <div 
          className="transition-transform duration-100 ease-out"
          style={{ transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)` }}
       >
          {/* Visual Eye - Handles Blinking & Glow */}
          <div className="w-48 h-48 bg-zinc-100 rounded-full shadow-[0_0_100px_rgba(220,38,38,0.6)] opacity-90 animate-blink" />
       </div>

       {/* Right Eye Wrapper - Handles Mouse Movement */}
       <div 
          className="transition-transform duration-100 ease-out"
          style={{ transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)` }}
       >
          {/* Visual Eye - Handles Blinking & Glow - Slight delay for irregularity */}
          <div className="w-48 h-48 bg-zinc-100 rounded-full shadow-[0_0_100px_rgba(220,38,38,0.6)] opacity-90 animate-blink" style={{ animationDelay: '0.15s' }} />
       </div>
    </div>
  );
};

const App = () => {
  // --- CRYPTO / BETTING STATE ---
  const [cryptoState, setCryptoState] = useState({
    balance: 1000.0, // Demo ETH/Token balance
    currentWager: 0,
    multiplier: 1.0,
    phase: 'main_menu' // Changed initial phase to 'main_menu'
  });

  // --- AUDIO STATE ---
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const [gameState, setGameState] = useState({
    round: 1,
    dealerHealth: 4,
    playerHealth: 4,
    liveShells: 2,
    blankShells: 2, // Balanced for demo
    playerInventory: [
      { id: 1, type: 'Cigarette', icon: <Cigarette className="w-5 h-5" />, description: 'Restores 1 HP' },
      { id: 2, type: 'Beer', icon: <Beer className="w-5 h-5" />, description: 'Ejects current shell' },
      { id: 3, type: 'Magnifier', icon: <Search className="w-5 h-5" />, description: 'Check current shell' },
      { id: 7, type: 'Saw', icon: <SawIcon className="w-5 h-5" />, description: 'Double Damage' },
    ],
    dealerInventory: [
      { id: 4, type: 'Saw', icon: <SawIcon className="w-5 h-5" />, description: 'Double damage' },
    ],
    log: ["System initialized.", "Waiting for wager..."],
  });

  const [activeItem, setActiveItem] = useState(null);
  const [aimingAt, setAimingAt] = useState(null); 
  const [shotEffect, setShotEffect] = useState(null); 
  const [shell, setShell] = useState(null); 
  
  // Power-up States
  const [isSawedOff, setIsSawedOff] = useState(false);
  const [dealerSkipped, setDealerSkipped] = useState(false); 
  const [scanningShell, setScanningShell] = useState(null); 
  const [effectOverlay, setEffectOverlay] = useState(null); 

  const addLog = (msg) => {
    setGameState(prev => ({
      ...prev,
      log: [msg, ...prev.log].slice(0, 5)
    }));
  };

  const triggerShell = (type, color = 'red') => {
    const id = Date.now();
    setShell({ type, id, color });
    setTimeout(() => {
      setShell(prev => (prev && prev.id === id ? null : prev));
    }, 800);
  };

  // --- GAME LOGIC HELPERS ---

  const handleStartGame = () => {
    const wager = 1; // Fixed wager
    if (wager > cryptoState.balance) {
      addLog("INSUFFICIENT FUNDS.");
      return;
    }

    setCryptoState(prev => ({
      ...prev,
      balance: prev.balance - wager,
      currentWager: wager,
      multiplier: 1.2, // Starting multiplier
      phase: 'playing'
    }));
    
    setGameState(prev => ({
        ...prev,
        round: 1,
        dealerHealth: 4,
        playerHealth: 4,
        log: ["Wager accepted.", "Good luck."]
    }));
  };

  const handleCashOut = () => {
    // Switch to success screen instead of immediately resetting
    setCryptoState(prev => ({
        ...prev,
        phase: 'withdrawal_success'
    }));
  };

  const finalizeWithdrawal = () => {
    const totalWin = cryptoState.currentWager * cryptoState.multiplier;
    setCryptoState(prev => ({
        ...prev,
        balance: prev.balance + totalWin,
        currentWager: 0,
        phase: 'main_menu', // UPDATED: Return to Main Menu
        multiplier: 1.0
    }));
    setGameState(prev => ({
        ...prev, 
        round: 1, 
        dealerHealth: 4, 
        playerHealth: 4,
        log: ["Funds withdrawn.", "Session ended."]
    }));
  };

  const handleContinue = () => {
      // Increase difficulty and multiplier
      setCryptoState(prev => ({
          ...prev,
          multiplier: parseFloat((prev.multiplier + 0.5).toFixed(1)),
          phase: 'playing'
      }));

      setGameState(prev => ({
          ...prev,
          round: prev.round + 1,
          dealerHealth: Math.min(6, prev.round + 4), // Dealer gets tougher
          playerHealth: 4, // Heal player
          log: ["Contract extended.", "Multiplier increased."]
      }));
  };

  const checkWinCondition = (newDealerHealth, newPlayerHealth) => {
      if (newDealerHealth <= 0) {
          setTimeout(() => setCryptoState(prev => ({ ...prev, phase: 'round_won' })), 1500);
      } else if (newPlayerHealth <= 0) {
          setTimeout(() => setCryptoState(prev => ({ ...prev, phase: 'game_over' })), 1500);
      }
  };

  // --- ACTIONS ---

  const handleShootSelf = () => {
    if (cryptoState.phase !== 'playing') return;

    addLog("The barrel feels cold against your temple.");
    setShotEffect('self');
    
    // Logic Sim: 50/50 chance for demo if no known shells
    const isLive = Math.random() > 0.4; // Slightly safer for player in demo
    const dmg = isLive ? (isSawedOff ? 2 : 1) : 0;
    
    triggerShell('self', isLive ? 'red' : 'white'); 

    if (isLive) {
        setGameState(prev => {
            const newHealth = Math.max(0, prev.playerHealth - dmg);
            checkWinCondition(prev.dealerHealth, newHealth);
            return { ...prev, playerHealth: newHealth };
        });
        addLog("BANG. You took damage.");
    } else {
        addLog("Click. Safe.");
    }
    
    setTimeout(() => {
        setShotEffect(null);
        setIsSawedOff(false); // Reset saw after shot
    }, 1000); 
  };

  const handleShootDealer = () => {
    if (cryptoState.phase !== 'playing') return;

    addLog("The eyes widen as you point the weapon.");
    setShotEffect('dealer');
    
    const isLive = Math.random() > 0.3; // 70% hit rate for demo fun
    const dmg = isLive ? (isSawedOff ? 2 : 1) : 0;

    triggerShell('dealer', isLive ? 'red' : 'white');

    if (isLive) {
        setGameState(prev => {
            const newHealth = Math.max(0, prev.dealerHealth - dmg);
            checkWinCondition(newHealth, prev.playerHealth);
            return { ...prev, dealerHealth: newHealth };
        });
        addLog("Hit. The dealer flinches.");
    } else {
        addLog("Click. A blank.");
    }

    setTimeout(() => {
        setShotEffect(null);
        setIsSawedOff(false); // Reset saw
    }, 1000); 
  };

  const handleUseItem = (item) => {
     if (cryptoState.phase !== 'playing') return;
     
     if (item.type === 'Cigarette') {
         setEffectOverlay('smoke');
         // Animate health up
         setTimeout(() => {
             setGameState(prev => ({...prev, playerHealth: Math.min(prev.playerHealth + 1, 4)}));
         }, 1000);
         // Smoke persists longer
         setTimeout(() => setEffectOverlay(null), 3000);
     }
     
     if (item.type === 'Saw') {
         if (isSawedOff) {
             addLog("Already sawed off.");
             return;
         }
         // Start sawing animation
         setEffectOverlay('sawing');
         // Apply effect AFTER animation
         setTimeout(() => {
             setIsSawedOff(true);
             setEffectOverlay(null);
             addLog("Barrel shortened.");
         }, 1500);
     }
     
     if (item.type === 'Beer') {
         const isLive = Math.random() > 0.5; // Simulate checking actual shell
         // Eject shell - pass color to trigger visual
         triggerShell('side', isLive ? 'red' : 'white'); 
         addLog(isLive ? "Live shell ejected." : "Blank shell ejected.");
     }

     if (item.type === 'Magnifier') {
         const isLive = Math.random() > 0.5;
         addLog("Checking chamber...");
         setScanningShell(isLive ? 'live' : 'blank');
         setTimeout(() => {
             setScanningShell(null);
             addLog(isLive ? "It's RED." : "It's GREY.");
         }, 2000);
     }
  };

  // Helper to determine gun transform class
  const getGunContainerClass = () => {
    if (aimingAt === 'dealer') return 'translate-y-[40px] scale-95'; 
    if (aimingAt === 'self') return 'translate-y-[10px] scale-110'; 
    return 'group-hover:scale-[1.02] group-hover:-rotate-1'; 
  };

  // --- UI COMPONENTS ---

  // Main Menu Button Component
  const MenuButton = ({ onClick, icon, label, primary }) => (
    <button 
      onClick={onClick}
      className={`group relative w-full py-4 border transition-all duration-300 overflow-hidden ${
        primary 
          ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40 hover:border-red-500' 
          : 'bg-zinc-900 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-300 ${primary ? 'bg-red-600/10' : 'bg-red-500/0 group-hover:bg-red-500/5'}`} />
      <div className="flex items-center justify-center gap-4 relative z-10">
        <span className={`transition-colors ${primary ? 'text-red-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
          {icon}
        </span>
        <span className={`font-black tracking-[0.2em] uppercase transition-colors ${primary ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
          {label}
        </span>
      </div>
        </button>
  );

  const InventoryBar = ({ items, owner, max = 4, onHover, onUse }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[0.5rem] text-zinc-400 tracking-[0.3em] uppercase font-bold text-shadow-glow">
        {owner} Assets
      </div>
      <div className="flex gap-2 p-2 bg-zinc-900/80 border border-zinc-700 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(20,0,0,0.5)]">
        {[...Array(max)].map((_, i) => {
          const item = items[i];
          return (
            <div 
              key={i}
              onClick={() => owner === 'Player' && item && onUse && onUse(item)}
              onMouseEnter={() => item && onHover(item)}
              onMouseLeave={() => onHover(null)}
              className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 relative group overflow-hidden
                ${item 
                  ? 'bg-zinc-800 border-red-500/50 hover:border-red-400 cursor-pointer text-zinc-200 hover:text-red-400 shadow-inner' 
                  : 'bg-transparent border-zinc-800 text-zinc-700'
                } rounded-md`}
            >
              {item ? item.icon : <div className="w-1 h-1 bg-zinc-700 rounded-full" />}
              {item && (
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const HealthBar = ({ health, max = 4, side = 'left' }) => (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {[...Array(max)].map((_, i) => (
        <div 
          key={i} 
          className={`w-8 h-10 border-2 transition-all duration-1000 ${
            i < health 
              ? 'bg-red-600 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse-slow' 
              : 'bg-zinc-900 border-zinc-800 opacity-50'
          } rounded-sm`}
        />
      ))}
      <div className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest px-2">
        {health}/{max}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono overflow-hidden flex flex-col relative selection:bg-red-900 selection:text-white">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed -inset-[100%] w-[300%] h-[300%] pointer-events-none z-[0] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-125 contrast-150 animate-noise" />
      <div className="fixed inset-0 pointer-events-none z-[0] bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.1)_70%,rgba(0,0,0,0.7)_100%)]" />

      {/* --- OVERLAYS --- */}
      {shotEffect === 'self' && <div className="fixed inset-0 z-[100] bg-red-600 pointer-events-none animate-flash-out mix-blend-overlay" />}
      
      {/* RESTORED: Realistic Cigarette Smoke Particles */}
      {effectOverlay === 'smoke' && (
        <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-zinc-400/20 rounded-full blur-[40px] animate-smoke-particle-1" />
            <div className="absolute bottom-[-10%] left-1/2 w-48 h-48 bg-zinc-500/20 rounded-full blur-[50px] animate-smoke-particle-2" />
            <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-zinc-300/10 rounded-full blur-[30px] animate-smoke-particle-3" />
            <div className="absolute inset-0 bg-zinc-500/5 mix-blend-overlay animate-smoke-fade" />
        </div>
      )}

      {/* --- MAIN MENU PHASE --- */}
      {cryptoState.phase === 'main_menu' && (
        <div className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="absolute -inset-[100%] w-[300%] h-[300%] pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-125 contrast-150 animate-noise" />
          
          {/* DEALER EYES - Tracking Mouse */}
          <DealerEyes />

          <div className="z-10 text-center mb-16 animate-in slide-in-from-bottom-8 duration-1000">
             <div className="text-red-600 font-black tracking-widest text-xs mb-2 uppercase">Protocol v1.0.4</div>
             <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-shadow-aberration leading-[0.85] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
               SHOTGUN<br/><span className="text-red-600">ROULETTE</span>
             </h1>
             <div className="w-32 h-1 bg-red-600 mx-auto mt-6 shadow-[0_0_20px_red]" />
          </div>

          <div className="z-10 w-full max-w-sm flex flex-col gap-4 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
             <MenuButton 
               onClick={() => setCryptoState(p => ({...p, phase: 'betting'}))} 
               icon={<Skull className="w-5 h-5"/>} 
               label="Play" 
               primary 
             />
             <MenuButton onClick={() => {}} icon={<Swords className="w-5 h-5"/>} label="PvP (Soon)" />
             <MenuButton onClick={() => {}} icon={<Trophy className="w-5 h-5"/>} label="Leaderboard" />
             <MenuButton onClick={() => {}} icon={<HelpCircle className="w-5 h-5"/>} label="How to Play" />
          </div>

          {/* Footer Controls */}
          <div className="absolute bottom-8 w-full px-8 flex justify-between items-end z-10 text-zinc-500">
             {/* Volume Control */}
             <div className="flex items-center gap-4 group">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="hover:text-red-500 transition-colors"
                >
                   {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden group-hover:bg-zinc-700 transition-colors">
                   <div 
                     className={`h-full bg-red-600 transition-all duration-200 ${isMuted ? 'w-0' : ''}`} 
                     style={{ width: isMuted ? '0%' : `${volume}%` }} 
                   />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={isMuted ? 0 : volume} 
                  onChange={(e) => {
                    setVolume(e.target.value);
                    if (Number(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="absolute opacity-0 w-32 cursor-pointer h-8 -ml-2"
                />
             </div>

             {/* Social Links */}
             <div className="flex gap-6">
                <button className="hover:text-[#5865F2] hover:scale-110 transition-all duration-200">
                  <DiscordIcon className="w-6 h-6" />
                </button>
                <button className="hover:text-white hover:scale-110 transition-all duration-200">
                  <XIcon className="w-6 h-6" />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- BETTING PHASE MODAL --- */}
      {cryptoState.phase === 'betting' && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_10px_red]" />
                  
                  <div className="text-center mb-8">
                      <h1 className="text-2xl font-black tracking-[0.2em] text-red-500 mb-2 text-shadow-aberration">ESTABLISH LINK</h1>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest">Connect Wallet & Initialize Contract</div>
                  </div>

                  <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded">
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-xs text-zinc-400 uppercase tracking-wider">Available Balance</span>
                          <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-zinc-500" /> 
                              {cryptoState.balance.toFixed(2)} ETH
                          </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-red-900/10 border border-red-500/20 rounded">
                          <span className="text-xs text-red-400 uppercase tracking-wider font-bold">Entry Cost</span>
                          <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-mono text-red-500 font-black tracking-tighter">1.00</span>
                              <span className="text-xs text-red-400 font-bold">ETH</span>
                          </div>
                      </div>
                      
                      <div className="text-center mt-4 text-[0.6rem] text-zinc-600 uppercase tracking-widest font-mono">
                          Standard Protocol Wager Locked
                      </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                        onClick={() => setCryptoState(p => ({...p, phase: 'main_menu'}))}
                        className="flex-1 py-4 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400 font-bold tracking-[0.2em] uppercase transition-all duration-300 text-xs"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleStartGame}
                        className="flex-[2] py-4 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 text-red-500 font-black tracking-[0.2em] uppercase transition-all duration-300 group"
                    >
                        <span className="group-hover:mr-2 transition-all">Sign Contract</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all">_&gt;</span>
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- ROUND WON / CASHOUT DECISION MODAL --- */}
      {cryptoState.phase === 'round_won' && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-zinc-900 border-y-2 border-red-600 p-8 relative shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-center mb-10">
                      <div className="inline-block px-4 py-1 bg-red-900/30 border border-red-500/30 text-red-400 text-[0.6rem] tracking-[0.3em] font-bold uppercase mb-4 animate-pulse">
                          Round {gameState.round} Cleared
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">SURVIVAL CONFIRMED</h2>
                      <p className="text-zinc-400 text-xs tracking-widest uppercase">Select your path</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-zinc-950 p-4 border border-zinc-800 flex flex-col items-center justify-center opacity-50">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Payout</div>
                          <div className="text-2xl font-bold text-zinc-300">{(cryptoState.currentWager * cryptoState.multiplier).toFixed(2)}</div>
                          <div className="text-[0.6rem] text-zinc-600 mt-1">{cryptoState.multiplier}x Multiplier</div>
                      </div>
                      <div className="bg-zinc-950 p-4 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-red-900/10 animate-pulse-slow"></div>
                          <div className="text-xs text-red-500 uppercase tracking-wider mb-1 font-bold">Next Potential</div>
                          <div className="text-2xl font-bold text-red-400">{(cryptoState.currentWager * (cryptoState.multiplier + 0.5)).toFixed(2)}</div>
                          <div className="text-[0.6rem] text-red-600 mt-1">{(cryptoState.multiplier + 0.5).toFixed(1)}x Multiplier</div>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={handleCashOut}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-xs transition-colors border-t border-zinc-600"
                      >
                          Sever Link (Withdraw)
                      </button>
                      <button 
                        onClick={handleContinue}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group"
                      >
                          Double Down <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- WITHDRAWAL SUCCESS MODAL --- */}
      {cryptoState.phase === 'withdrawal_success' && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md border border-green-500/30 p-8 relative shadow-[0_0_100px_rgba(34,197,94,0.1)] animate-in fade-in zoom-in-95 duration-500 bg-zinc-950">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-green-900/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                          <Wallet className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-1 tracking-widest text-shadow-glow">LINK SEVERED</h2>
                      <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase">Funds Secured</p>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-3 border-b border-zinc-800">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Initial Wager</span>
                          <span className="font-mono text-zinc-300">{cryptoState.currentWager.toFixed(2)} ETH</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border-b border-zinc-800">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Multiplier</span>
                          <span className="font-mono text-green-400">{cryptoState.multiplier}x</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/20 rounded">
                          <span className="text-xs text-green-500 uppercase tracking-wider font-bold">Total Payout</span>
                          <span className="text-xl font-black text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
                              {(cryptoState.currentWager * cryptoState.multiplier).toFixed(2)} ETH
                          </span>
                      </div>
                  </div>

                  <button 
                    onClick={finalizeWithdrawal}
                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-green-500/50 text-zinc-300 hover:text-green-400 font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300"
                  >
                      Return to Terminal
                  </button>
              </div>
          </div>
      )}

      {/* --- GAME OVER MODAL --- */}
      {cryptoState.phase === 'game_over' && (
          <div className="fixed inset-0 z-[200] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="text-center animate-in zoom-in duration-300">
                  <Skull className="w-24 h-24 text-black mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" />
                  <h1 className="text-6xl font-black text-white tracking-tighter mb-2 text-shadow-aberration">YOU DIED</h1>
                  <div className="text-red-300 font-mono tracking-widest text-sm mb-8">
                      LOSS: {cryptoState.currentWager.toFixed(2)} ETH
                  </div>
                  <button 
                    onClick={() => {
                        setCryptoState(prev => ({ ...prev, currentWager: 0, phase: 'main_menu', multiplier: 1.0 })); // Reset to main menu
                        setGameState(prev => ({...prev, round: 1, dealerHealth: 4, playerHealth: 4}));
                    }}
                    className="px-8 py-3 bg-black text-red-500 border border-red-500/50 hover:bg-red-900/20 font-bold tracking-[0.2em] uppercase transition-all"
                  >
                      Re-Initialize
                  </button>
              </div>
          </div>
      )}

      {/* TOP HEADER */}
      <header className="p-6 bg-transparent relative z-50 flex justify-between items-center border-b border-red-500/20">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-red-900/10"></div>
            <div className="relative z-10 opacity-90">
                <User className="text-zinc-400 w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] text-red-500 font-bold tracking-tighter mb-1 text-shadow-aberration">UNIT_PLAYER_01</div>
            <HealthBar health={gameState.playerHealth} />
          </div>
        </div>

        {/* --- ECONOMY HUD --- */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-6 mb-2 bg-zinc-900/80 px-6 py-2 rounded-full border border-zinc-800 backdrop-blur-sm shadow-md">
             {/* Left Side: Wager - Fixed width to balance layout */}
             <div className="flex flex-col items-end w-24">
                 <span className="text-[0.5rem] text-zinc-500 uppercase tracking-widest font-bold">Wager</span>
                 <span className="text-sm font-mono text-zinc-200">{cryptoState.currentWager}</span>
             </div>
             
             {/* Center Divider */}
             <div className="h-6 w-px bg-zinc-700"></div>
             
             {/* Right Side: Win - Fixed width to balance layout */}
             <div className="flex flex-col items-start w-24">
                 <span className="text-[0.5rem] text-red-500 uppercase tracking-widest font-bold flex items-center gap-1">
                     <TrendingUp size={8} /> Win ({cryptoState.multiplier}x)
                 </span>
                 <span className="text-sm font-mono text-red-400 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                     {(cryptoState.currentWager * cryptoState.multiplier).toFixed(0)}
                 </span>
             </div>
          </div>
          
          <div className="text-[0.6rem] text-zinc-400 font-bold">
            <span className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">LIVE: {gameState.liveShells}</span> <span className="mx-2 opacity-30">|</span> <span className="text-zinc-500">BLANK: {gameState.blankShells}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-row-reverse flex-1">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="relative w-full h-full flex items-center justify-center">
               <div className="w-1 h-1 bg-red-600 rounded-full absolute left-3 shadow-[0_0_8px_red]" />
               <div className="w-1 h-1 bg-red-600 rounded-full absolute right-3 shadow-[0_0_8px_red]" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.65rem] text-red-500 font-bold tracking-tighter mb-1 text-shadow-aberration">THE_DEALER</div>
            <HealthBar health={gameState.dealerHealth} side="right" />
          </div>
        </div>
      </header>

      {/* GAME TABLE AREA */}
      <main className={`flex-1 relative flex flex-col items-center justify-between pt-8 pb-8 px-8 bg-transparent z-40 ${shotEffect ? 'animate-shake' : ''}`}>
        
        {/* TOP SECTION: Dealer Eyes & Inventory */}
        <div className="flex flex-col items-center gap-2 w-full -mt-8">
          <div className="relative group">
               <div className={`absolute -inset-24 bg-red-900/5 blur-[90px] rounded-full pointer-events-none transition-all duration-300 ${shotEffect === 'dealer' ? 'bg-red-600/30 blur-[120px]' : ''} animate-pulse-slow`} />
               
               <div className={`w-48 h-32 flex items-center justify-center relative transition-transform duration-200 ${shotEffect === 'dealer' ? 'scale-125' : ''}`}>
                 <div className="absolute left-[30%] -translate-x-1/2 flex flex-col items-center">
                   <div className={`w-3 h-3 rounded-full transition-all duration-200 animate-blink ${shotEffect === 'dealer' ? 'bg-red-600 shadow-[0_0_30px_red] w-6 h-6' : 'bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.6)]'}`} style={{ animationDuration: '6s', animationDelay: '0.2s' }}>
                     <div className={`w-0.5 h-0.5 rounded-full mt-1 ml-1 blur-[0.5px] ${shotEffect === 'dealer' ? 'bg-red-200 opacity-90' : 'bg-black opacity-40'}`} />
                   </div>
                 </div>

                 <div className="absolute right-[30%] translate-x-1/2 flex flex-col items-center">
                   <div className={`w-3 h-3 rounded-full transition-all duration-200 animate-blink ${shotEffect === 'dealer' ? 'bg-red-600 shadow-[0_0_30px_red] w-6 h-6' : 'bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.6)]'}`} style={{ animationDuration: '5.5s', animationDelay: '0s' }}>
                     <div className={`w-0.5 h-0.5 rounded-full mt-1 ml-1 blur-[0.5px] ${shotEffect === 'dealer' ? 'bg-red-200 opacity-90' : 'bg-black opacity-40'}`} />
                   </div>
                 </div>

                 <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none animate-noise" />
               </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-4 duration-1000 -mt-16 relative z-10 opacity-90">
            <InventoryBar 
              items={gameState.dealerInventory} 
              owner="Dealer" 
              max={4} 
              onHover={setActiveItem} 
            />
          </div>
        </div>

        {/* MIDDLE SECTION: THE SHOTGUN */}
        <div className="flex-1 flex items-center justify-center w-full max-w-3xl relative py-4 z-20 -mt-20">
          <div className="relative w-full h-40 flex items-center justify-center group cursor-crosshair">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-zinc-800/30 blur-2xl rounded-[100%] transition-all duration-1000" />
             
             <svg 
               viewBox="0 0 800 200" 
               className={`w-full h-full drop-shadow-2xl transition-all duration-700 ease-out origin-center ${getGunContainerClass()}`}
             >
                <defs>
                  <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#71717a" />
                    <stop offset="50%" stopColor="#3f3f46" />
                    <stop offset="100%" stopColor="#18181b" />
                  </linearGradient>
                  <linearGradient id="barrel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="40%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#3f3f46" />
                  </linearGradient>
                  <linearGradient id="barrel-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#18181b" />
                    <stop offset="35%" stopColor="#52525b" />
                    <stop offset="50%" stopColor="#71717a" />
                    <stop offset="65%" stopColor="#52525b" />
                    <stop offset="100%" stopColor="#18181b" />
                  </linearGradient>
                  <linearGradient id="stock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3f3f46" />
                    <stop offset="40%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>
                  <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                   <pattern id="knurl" width="4" height="4" patternUnits="userSpaceOnUse">
                     <path d="M 0,4 L 4,0 M -1,1 L 1,-1 M 3,5 L 5,3" stroke="#52525b" strokeWidth="1" />
                   </pattern>
                </defs>

                {shell && shell.type === 'self' && (
                  <g className={`animate-shell-eject-${shell.type}`} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: 'translate(420px, 80px)' }}>
                     <rect x="0" y="0" width="12" height="24" rx="1" fill={shell.color === 'red' ? "#ef4444" : "#e4e4e7"} stroke={shell.color === 'red' ? "#7f1d1d" : "#52525b"} strokeWidth="1" />
                     <rect x="0" y="18" width="12" height="6" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
                  </g>
                )}

                {aimingAt === null && (
                  <g className="animate-in fade-in zoom-in-95 duration-700">
                    <path d="M220,75 L90,85 L85,155 L145,150 Q180,150 220,125 Z" fill="url(#stock-grad)" stroke="#27272a" strokeWidth="1" />
                    <path d="M85,155 L145,150 Q180,150 220,125 L215,135 Q175,155 145,155 L90,158 Z" fill="#000" opacity="0.6" filter="blur(2px)" />
                    <g transform="translate(220, 70)">
                       <rect x="0" y="0" width="140" height="70" rx="2" fill="url(#metal-grad)" stroke="#52525b" strokeWidth="1" />
                       <rect x="40" y="25" width="60" height="15" rx="1" fill="#18181b" opacity="0.8" />
                       <circle cx="20" cy="20" r="3" fill="#18181b" />
                       <circle cx="110" cy="20" r="3" fill="#18181b" />
                    </g>
                    <g transform="translate(240, 140)">
                       <path d="M0,0 Q0,25 25,25 L50,0" fill="none" stroke="#71717a" strokeWidth="4" />
                       <path d="M25,5 L25,15" stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />
                    </g>
                    <g transform="translate(360, 75)">
                       <rect x="0" y="0" width={isSawedOff ? "220" : "400"} height="25" fill="url(#barrel-grad)" className="transition-all duration-300" />
                       <rect x="0" y="30" width={isSawedOff ? "180" : "350"} height="20" fill="#27272a" className="transition-all duration-300" />
                       <rect x={isSawedOff ? "190" : "340"} y="0" width="10" height="50" fill="#3f3f46" className="transition-all duration-300" />
                       <g transform="translate(80, 25)">
                         <rect x="0" y="0" width="120" height="30" rx="4" fill="#3f3f46" stroke="#52525b" />
                         <rect x="10" y="5" width="100" height="20" fill="url(#knurl)" opacity="0.6" />
                       </g>
                    </g>
                    <rect x={isSawedOff ? "570" : "750"} y="72" width="4" height="4" fill="#fcd34d" className="transition-all duration-300" />

                    {/* RESTORED: Magnifying Glass Effect */}
                    {scanningShell && (
                       <g className="animate-in fade-in zoom-in duration-300" style={{ transformOrigin: '290px 100px' }}>
                         {/* Magnifying Glass shape */}
                         <circle cx="290" cy="100" r="35" fill="#000" stroke="#9ca3af" strokeWidth="4" opacity="0.95" />
                         
                         {/* The Revealed Shell */}
                         <g transform="translate(275, 94)">
                            {/* Brass Base */}
                            <rect x="0" y="0" width="8" height="12" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
                            {/* Plastic Body */}
                            <rect x="8" y="0" width="22" height="12" rx="1" 
                                  fill={scanningShell === 'live' ? "#ef4444" : "#e4e4e7"} 
                                  stroke={scanningShell === 'live' ? "#7f1d1d" : "#52525b"} strokeWidth="1" />
                         </g>
                         
                         {/* Glass Reflection */}
                         <circle cx="290" cy="100" r="35" fill="url(#glass-grad)" opacity="0.4" />
                         {/* Handle */}
                         <path d="M315,125 L345,155" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
                         
                         {/* Label */}
                         <text x="290" y="80" textAnchor="middle" fill={scanningShell === 'live' ? "#ef4444" : "#e4e4e7"} fontSize="10" fontWeight="bold" letterSpacing="2" style={{textShadow: '0 0 5px currentColor'}}>
                            {scanningShell === 'live' ? 'LIVE' : 'BLANK'}
                         </text>
                       </g>
                    )}
                  </g>
                )}

                {aimingAt === 'self' && (
                  <g className="animate-in fade-in zoom-in-110 duration-700">
                    <path d="M375,80 L425,80 L445,140 L355,140 Z" fill="url(#barrel-grad)" />
                    <path d="M385,85 L415,85 L430,150 L370,150 Z" fill="#27272a" opacity="0.9" />
                    <path d="M365,110 L370,120 L360,135 L358,125 Z" fill="url(#knurl)" opacity="0.5" />
                    <path d="M435,110 L430,120 L440,135 L442,125 Z" fill="url(#knurl)" opacity="0.5" />
                    <circle cx="400" cy="165" r="28" fill="#27272a" stroke="#52525b" strokeWidth="2"/>
                    <circle cx="400" cy="165" r="22" fill="#18181b" />
                    <circle cx="400" cy="110" r="42" fill="url(#metal-grad)" stroke={isSawedOff ? "#94a3b8" : "#3f3f46"} strokeWidth="3" strokeDasharray={isSawedOff ? "4 2" : "0"} />
                    <circle cx="400" cy="110" r="32" fill="#09090b" />
                    <circle cx="400" cy="110" r="30" stroke="#7f1d1d" strokeWidth="1" fill="none" opacity="0.5" /> 
                    <circle cx="400" cy="110" r="12" fill="#000" />
                    {!isSawedOff && <rect x="397" y="60" width="6" height="8" rx="1" fill="#fcd34d" />}
                  </g>
                )}

                {aimingAt === 'dealer' && (
                  <g className="animate-in fade-in zoom-in-95 duration-700">
                      <path d="M375,70 L425,70 L415,10 L385,10 Z" fill="#18181b" />
                      <path d={isSawedOff ? "M360,70 L440,70 L435,40 L365,40 Z" : "M360,70 L440,70 L428,5 L372,5 Z"} fill="url(#barrel-3d)" />
                      {!isSawedOff && <path d="M396,70 L404,70 L402,5 L398,5 Z" fill="#27272a" />}
                      <path d="M350,60 L450,60 L440,30 L360,30 Z" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
                      <path d="M352,55 L448,55" stroke="#52525b" strokeWidth="2" opacity="0.4" />
                      <path d="M355,45 L445,45" stroke="#52525b" strokeWidth="2" opacity="0.4" />
                      <path d="M358,35 L442,35" stroke="#52525b" strokeWidth="2" opacity="0.4" />
                      <path d="M330,120 L470,120 L455,70 L345,70 Z" fill="url(#metal-grad)" stroke="#3f3f46" strokeWidth="1" />
                      <path d="M398,70 L402,70 L405,120 L395,120 Z" fill="#000" opacity="0.5" />
                      <path d="M330,120 L345,70 L340,70 L310,120 Z" fill="#27272a" />
                      <path d="M470,120 L455,70 L460,70 L490,120 Z" fill="#27272a" />
                      <path d="M330,120 L470,120 L490,160 L310,160 Z" fill="#27272a" />
                      <path d="M310,160 L490,160 L550,220 L250,220 Z" fill="#18181b" />
                      <path d="M310,160 Q400,150 490,160" fill="none" stroke="#52525b" strokeWidth="1" opacity="0.3" />
                      {!isSawedOff && <circle cx="400" cy="4" r="3" fill="#fcd34d" filter="drop-shadow(0 0 3px #fcd34d)" />}
                  </g>
                )}

                {effectOverlay === 'sawing' && (
                    <g className="animate-sawing" style={{ transformBox: 'fill-box' }}>
                        <path d="M580,30 L580,90 L565,90 L570,85 L565,80 L570,75 L565,70 L570,65 L565,60 L570,55 L565,50 L570,45 L565,40 L570,35 L580,30 Z" fill="#52525b" stroke="#27272a" strokeWidth="1" />
                        <path d="M580,30 L585,20 L575,15 L565,20 L565,30 Z" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                        <circle cx="570" cy="85" r="2" fill="#fbbf24" className="animate-ping" />
                        <circle cx="565" cy="80" r="1" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.1s' }} />
                    </g>
                )}

                {shell && shell.type !== 'self' && (
                  <g className={`animate-shell-eject-${shell.type}`} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: shell.type === 'dealer' ? 'translate(480px, 100px)' : (shell.type === 'self' ? 'translate(420px, 80px)' : 'translate(280px, 80px)') }}>
                     <rect x="0" y="0" width="12" height="24" rx="1" fill={shell.color === 'red' ? "#ef4444" : "#e4e4e7"} stroke={shell.color === 'red' ? "#7f1d1d" : "#52525b"} strokeWidth="1" /> 
                     <rect x="0" y="18" width="12" height="6" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="1" /> 
                  </g>
                )}
             </svg>
          </div>
        </div>

        {/* BOTTOM SECTION: Inputs & Player Inventory */}
        <div className="flex flex-col items-center gap-4 w-full mb-0">
          <div className="flex gap-8 relative z-10">
            <button 
              onClick={handleShootSelf}
              onMouseEnter={() => setAimingAt('self')}
              onMouseLeave={() => setAimingAt(null)}
              disabled={cryptoState.phase !== 'playing'}
              className="group relative px-8 py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[0.7rem] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -top-2 left-2 bg-zinc-900 px-1 text-[0.4rem] text-zinc-500">INPUT_01</div>
              Point at Self
            </button>
            <button 
              onClick={handleShootDealer}
              onMouseEnter={() => setAimingAt('dealer')}
              onMouseLeave={() => setAimingAt(null)}
              disabled={cryptoState.phase !== 'playing'}
              className="group relative px-8 py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[0.7rem] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -top-2 left-2 bg-zinc-900 px-1 text-[0.4rem] text-zinc-500">INPUT_02</div>
              Point at Him
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center">
            <div className={`mb-2 h-4 text-[0.6rem] transition-opacity duration-300 ${activeItem ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-red-500 font-bold uppercase mr-2 tracking-widest">{activeItem?.type}</span>
              <span className="text-zinc-400">{activeItem?.description}</span>
            </div>
            
            <InventoryBar 
              items={gameState.playerInventory} 
              owner="Player" 
              max={4} 
              onHover={setActiveItem} 
              onUse={handleUseItem}
            />
          </div>
        </div>

        {/* Side Logs */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-56 border-l border-zinc-800/50 pl-4 space-y-3 hidden lg:block opacity-80 hover:opacity-100 transition-opacity">
           <div className="text-[0.5rem] text-zinc-500 tracking-widest font-black uppercase border-b border-zinc-800/50 pb-1 text-shadow-sm">Telemetry</div>
           {gameState.log.map((log, i) => (
             <div key={i} className={`text-[0.6rem] ${i === 0 ? 'text-red-400 font-bold animate-pulse-slow' : 'text-zinc-400'} leading-tight tracking-tight`}>
               {`[${new Date().getSeconds()}:${i}] ${log.toUpperCase()}`}
             </div>
           ))}
        </div>
      </main>

      <style>{`
        @keyframes blink {
          0%, 85%, 100% { transform: scaleY(1); opacity: 1; filter: brightness(1); }
          87% { transform: scaleY(0.4); opacity: 0.8; }
          89% { transform: scaleY(1); opacity: 1; }
          95% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); opacity: 0.6; } 
          99% { transform: scaleY(1); }
        }
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }
        @keyframes flash-out {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shell-eject-side {
          0% { transform: translate(280px, 80px) rotate(0deg); opacity: 1; }
          20% { transform: translate(300px, 40px) rotate(120deg) scale(1.2); }
          100% { transform: translate(450px, 300px) rotate(720deg) scale(1.5); opacity: 0; }
        }
        @keyframes shell-eject-self {
          0% { transform: translate(420px, 80px) rotate(0deg) scale(1); opacity: 1; }
          20% { transform: translate(460px, 60px) rotate(90deg) scale(1.2); }
          100% { transform: translate(550px, 150px) rotate(360deg) scale(0.5); opacity: 0; }
        }
        @keyframes shell-eject-dealer {
          0% { transform: translate(480px, 100px) rotate(0deg) scale(1); opacity: 1; }
          20% { transform: translate(520px, 60px) rotate(60deg) scale(1.2); }
          100% { transform: translate(650px, 180px) rotate(400deg) scale(0.8); opacity: 0; }
        }
        @keyframes smoke-fade {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes smoke-particle-1 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            20% { opacity: 0.6; }
            100% { transform: translateY(-120px) translateX(20px) scale(2); opacity: 0; }
        }
        @keyframes smoke-particle-2 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            30% { opacity: 0.5; }
            100% { transform: translateY(-150px) translateX(-30px) scale(2.5); opacity: 0; }
        }
        @keyframes smoke-particle-3 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            40% { opacity: 0.4; }
            100% { transform: translateY(-100px) translateX(10px) scale(1.8); opacity: 0; }
        }
        @keyframes sawing {
            0% { transform: translateY(0); }
            25% { transform: translateY(-15px); }
            75% { transform: translateY(5px); }
            100% { transform: translateY(0); }
        }
        
        .animate-shell-eject-side { animation: shell-eject-side 0.8s ease-out forwards; }
        .animate-shell-eject-self { animation: shell-eject-self 0.8s ease-out forwards; }
        .animate-shell-eject-dealer { animation: shell-eject-dealer 0.8s ease-out forwards; }
        .animate-smoke-fade { animation: smoke-fade 3s ease-out forwards; }
        .animate-smoke-particle-1 { animation: smoke-particle-1 3s ease-out forwards; }
        .animate-smoke-particle-2 { animation: smoke-particle-2 3.5s ease-out forwards; }
        .animate-smoke-particle-3 { animation: smoke-particle-3 2.8s ease-out forwards; }
        .animate-sawing { animation: sawing 0.2s linear infinite; }
        .animate-blink { animation: blink 6s infinite ease-in-out; }
        .animate-noise { animation: noise 2s steps(10) infinite; }
        .animate-flash-out { animation: flash-out 1s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .text-shadow-sm { text-shadow: 0 0 2px rgba(185,28,28,0.3); }
        .text-shadow-glow { text-shadow: 0 0 8px rgba(185,28,28,0.4); }
        .text-shadow-aberration { text-shadow: 1px 0 0 rgba(255,0,0,0.5), -1px 0 0 rgba(0,0,255,0.3); }
      `}</style>
    </div>
  );
};

export default App;
