import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, SHOTGUN_ROULETTE_ABI, SERVER_URL } from './contractConfig';
import { verifyRNGComponents, formatRNGData, verifyBaseSeed } from './utils/rngVerification';
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
  HelpCircle,
  Disc,
  Shield,
  Trash2,
  HandMetal,
  RefreshCw,
  Pill,
  X,
  Target,
  Loader2
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

// Custom Inverter Icon
const InverterIcon = ({ className }) => (
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
    <path d="M7 16V4l-4 4" />
    <path d="M17 8v12l4-4" />
    <circle cx="7" cy="19" r="2" fill="currentColor" />
    <circle cx="17" cy="5" r="2" fill="currentColor" />
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

// --- GAME CONSTANTS & HELPERS ---
const HP_MAX = 4;
const DEFAULT_SEED = 1337421;
const MAX_INVENTORY = 4;

const ITEM_CONFIG = {
  MAGNIFYING_GLASS: {
    label: 'Magnifying Glass',
    description: 'Reveal current shell',
    weight: 0.10,
    icon: <Search className="w-5 h-5" />
  },
  BEER: {
    label: 'Beer',
    description: 'Eject current shell',
    weight: 0.10,
    icon: <Beer className="w-5 h-5" />
  },
  HAND_SAW: {
    label: 'Hand Saw',
    description: 'Next shot deals 2x damage',
    weight: 0.10,
    icon: <SawIcon className="w-5 h-5" />
  },
  SKIP: {
    label: 'Skip',
    description: 'Opponent skips next turn',
    weight: 0.10,
    icon: <SkipIcon className="w-5 h-5" />
  },
  CIGARETTES: {
    label: 'Cigarettes',
    description: 'Heal 1 HP (max 4)',
    weight: 0.10,
    icon: <Cigarette className="w-5 h-5" />
  },
  SHIELD: {
    label: 'Shield',
    description: 'Block next 1 damage',
    weight: 0.10,
    icon: <Shield className="w-5 h-5" />
  },
  SHAKE_DOWN: {
    label: 'Shake Down',
    description: 'Destroy random opponent item',
    weight: 0.10,
    icon: <Trash2 className="w-5 h-5" />
  },
  STEAL: {
    label: 'Steal',
    description: 'Steal random item from opponent',
    weight: 0.10,
    icon: <HandMetal className="w-5 h-5" />
  },
  INVERTER: {
    label: 'Inverter',
    description: 'Swap current shell polarity',
    weight: 0.10,
    icon: <InverterIcon className="w-5 h-5" />
  },
  RANDOM_PILL: {
    label: 'Random Pill',
    description: '50% heal 2 HP or take 1 damage',
    weight: 0.10,
    icon: <Pill className="w-5 h-5" />
  }
};

const ACTOR_LABEL = {
  player: 'YOU',
  dealer: 'DEALER'
};

const freshKnowledge = () => ({
  player: { currentShellKnown: false, knownCurrentShellType: null },
  dealer: { currentShellKnown: false, knownCurrentShellType: null }
});

const freshStatus = () => ({
  player: { skipTurnsRemaining: 0 },
  dealer: { skipTurnsRemaining: 0 }
});

const freshTempEffects = () => ({
  player: { doubleDamageNextShot: false, shieldNextDamage: 0 },
  dealer: { doubleDamageNextShot: false, shieldNextDamage: 0 }
});

const pushTelemetry = (prevLog, messages) => {
  const msgs = Array.isArray(messages) ? messages : [messages];
  const combined = [...prevLog, ...msgs];
  return combined.slice(Math.max(0, combined.length - 40));
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWith = (arr, rng) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickWeightedItem = (rng) => {
  const roll = rng();
  let sum = 0;
  const entries = Object.values(ITEM_CONFIG);
  const keys = Object.keys(ITEM_CONFIG);
  for (let i = 0; i < entries.length; i++) {
    sum += entries[i].weight;
    if (roll <= sum) return keys[i];
  }
  return keys[keys.length - 1];
};

const buildItem = (kind, rng) => {
  const cfg = ITEM_CONFIG[kind];
  if (!cfg) return null;
  return {
    id: `itm-${Math.floor(rng() * 1_000_000_000)}`,
    kind,
    type: cfg.label,
    icon: cfg.icon,
    description: cfg.description
  };
};

const clampHp = (hp) => Math.max(0, Math.min(HP_MAX, hp));
const DEALER_TURN_DELAY_MS = 4000;

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
          <div
            className="w-48 h-48 bg-zinc-100 rounded-full shadow-[0_0_100px_rgba(220,38,38,0.6)] opacity-90 animate-blink"
            style={{ boxShadow: '0 0 100px rgba(220,38,38,0.6), 0 0 120px rgba(255,255,255,0.35)' }}
          />
       </div>

       {/* Right Eye Wrapper - Handles Mouse Movement */}
       <div 
          className="transition-transform duration-100 ease-out"
          style={{ transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)` }}
       >
          {/* Visual Eye - Handles Blinking & Glow - Slight delay for irregularity */}
          <div
            className="w-48 h-48 bg-zinc-100 rounded-full shadow-[0_0_100px_rgba(220,38,38,0.6)] opacity-90 animate-blink"
            style={{ animationDelay: '0.15s', boxShadow: '0 0 100px rgba(220,38,38,0.6), 0 0 120px rgba(255,255,255,0.35)' }}
          />
       </div>
    </div>
  );
};

// Monad Testnet Configuration
const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadvision.com'],
};

const MONAD_CHAIN_ID = 10143;

const App = () => {
  // --- WALLET CONNECTION STATE ---
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const providerRef = useRef(null);
  const signerRef = useRef(null);
  const contractRef = useRef(null);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [entropyStatus, setEntropyStatus] = useState(null); // 'requesting', 'waiting', 'received', null
  const rewardClaimedRef = useRef(false);
  const gameIdRef = useRef(null); // Store gameId from server
  const [rngVerificationData, setRngVerificationData] = useState(null);
  const [showRNGVerification, setShowRNGVerification] = useState(false);

  // --- CRYPTO / BETTING STATE ---
  const [cryptoState, setCryptoState] = useState({
    balance: 0.0,
    currentWager: 0,
    multiplier: 1.0,
    phase: 'main_menu',
    walletAddress: '0x0000000000000000000000000000000000000000'
  });

  // --- AUDIO STATE ---
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  
  // --- HOW TO PLAY MODAL ---
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // --- PROFILE MODAL ---
  const [showProfile, setShowProfile] = useState(false);

  const createInitialGameState = (seed = DEFAULT_SEED) => ({
    round: 0,
    dealerHealth: HP_MAX,
    playerHealth: HP_MAX,
    liveShells: 0,
    blankShells: 0,
    chamber: [],
    currentShellIndex: 0,
    playerInventory: [],
    dealerInventory: [],
    log: ["System initialized.", "Waiting for wager..."],
    statusEffects: freshStatus(),
    tempEffects: {
      player: { doubleDamageNextShot: false, shieldNextDamage: 0 },
      dealer: { doubleDamageNextShot: false, shieldNextDamage: 0 }
    },
    knowledge: freshKnowledge(),
    currentTurn: 'player',
    matchOver: false,
    seed,
  itemsPerRound: 0,
  lastOutcome: null
  });

  const [gameState, setGameState] = useState(() => createInitialGameState());

  // --- WALLET CONNECTION FUNCTIONS ---
  const checkWalletConnection = async () => {
    if (typeof window.ethereum === 'undefined') {
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        if (chainId === MONAD_CHAIN_ID) {
          providerRef.current = provider;
          signerRef.current = await provider.getSigner();
          
          // Initialize contract if address is configured
          if (CONTRACT_CONFIG.address && CONTRACT_CONFIG.address !== '0x0000000000000000000000000000000000000000') {
            contractRef.current = new ethers.Contract(
              CONTRACT_CONFIG.address,
              SHOTGUN_ROULETTE_ABI,
              signerRef.current
            );
          }
          
          const address = await signerRef.current.getAddress();
          const balance = await provider.getBalance(address);
          
          setCryptoState(prev => ({
            ...prev,
            walletAddress: address,
            balance: parseFloat(ethers.formatEther(balance))
          }));
          setIsWalletConnected(true);
          return true;
        } else {
          // Wrong network
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  };

  const switchToMonadTestnet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setConnectionError('Please install MetaMask or another Web3 wallet');
      return false;
    }

    try {
      // Try to switch to Monad testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the chain
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Monad testnet:', addError);
          setConnectionError('Failed to add Monad testnet to wallet');
          return false;
        }
      } else {
        console.error('Error switching to Monad testnet:', switchError);
        setConnectionError('Failed to switch to Monad testnet');
        return false;
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setConnectionError('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // First, switch to Monad testnet
      const switched = await switchToMonadTestnet();
      if (!switched) {
        setIsConnecting(false);
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = provider;
      signerRef.current = await provider.getSigner();

      // Initialize contract
      if (CONTRACT_CONFIG.address !== '0x0000000000000000000000000000000000000000') {
        contractRef.current = new ethers.Contract(
          CONTRACT_CONFIG.address,
          SHOTGUN_ROULETTE_ABI,
          signerRef.current
        );
      }

      // Get address and balance
      const address = await signerRef.current.getAddress();
      const balance = await provider.getBalance(address);

      // Update state
      setCryptoState(prev => ({
        ...prev,
        walletAddress: address,
        balance: parseFloat(ethers.formatEther(balance))
      }));
      setIsWalletConnected(true);
      setShowWalletModal(false);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setConnectionError('Connection rejected by user');
      } else {
        setConnectionError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setIsWalletConnected(false);
      setCryptoState(prev => ({
        ...prev,
        walletAddress: '0x0000000000000000000000000000000000000000',
        balance: 0
      }));
      setShowWalletModal(true);
    } else {
      // Account changed, reconnect
      await checkWalletConnection();
    }
  };

  const handleChainChanged = async (chainId) => {
    const chainIdNum = parseInt(chainId, 16);
    if (chainIdNum !== MONAD_CHAIN_ID) {
      setIsWalletConnected(false);
      setShowWalletModal(true);
      setConnectionError('Please switch to Monad Testnet');
    } else {
      await checkWalletConnection();
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    const init = async () => {
      const connected = await checkWalletConnection();
      if (!connected) {
        setShowWalletModal(true);
      } else {
        setShowWalletModal(false);
        // Set up listeners
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        }
      }
    };
    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (!isWalletConnected || !providerRef.current) return;

    const updateBalance = async () => {
      try {
        const balance = await providerRef.current.getBalance(cryptoState.walletAddress);
        setCryptoState(prev => ({
          ...prev,
          balance: parseFloat(ethers.formatEther(balance))
        }));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    };

    const interval = setInterval(updateBalance, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [isWalletConnected, cryptoState.walletAddress]);

  const [hoveredInventoryItem, setHoveredInventoryItem] = useState(null); // For inventory item tooltips
  const hoverTimeoutRef = useRef(null);
  
  // Debounced hover clear - prevents flicker when moving between items
  const clearHoverWithDelay = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredInventoryItem(null);
    }, 100);
  };
  
  const setHoverItem = (item) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredInventoryItem(item);
  };
  const [aimingAt, setAimingAt] = useState(null); 
  const [shotEffect, setShotEffect] = useState(null); 
  const [shell, setShell] = useState(null); 
  const [isSawedOff, setIsSawedOff] = useState(false);
  const [scanningShell, setScanningShell] = useState(null); 
  const [effectOverlay, setEffectOverlay] = useState(null); 
  const [suppressHoverAim, setSuppressHoverAim] = useState(false);
  const [playerLockUntil, setPlayerLockUntil] = useState(0);
  const [gameMousePos, setGameMousePos] = useState({ x: 0, y: 0 });
  const gameEyesRef = useRef(null);
  const gameStateRef = useRef(null);
  const dealerTimerRef = useRef(null);
  const wheelStateRef = useRef(null);
  const spinLockRef = useRef(false); // Prevents double-spin race condition
  const [hoveredWheelItem, setHoveredWheelItem] = useState(null); // For wheel item tooltips
  const [wheelState, setWheelState] = useState({
    active: false,
    queue: [],
    pool: Object.keys(ITEM_CONFIG),
    spinning: false,
    rotation: 0,
    lastItem: null,
    currentOwner: null,
    startTurn: 'player'
  });
  const scheduleDealerTurnDelay = () => {
    if (dealerTimerRef.current) clearTimeout(dealerTimerRef.current);
    dealerTimerRef.current = setTimeout(() => {
      dealerTimerRef.current = null;
      dealerTakeTurn();
    }, DEALER_TURN_DELAY_MS);
  };

  const rngSeedRef = useRef(DEFAULT_SEED);
  const rngRef = useRef(mulberry32(DEFAULT_SEED));

  const reseed = (seedVal) => {
    // Convert hex string to integer for seeding if necessary
    let seedInt;
    if (typeof seedVal === 'string') {
      // Handle hex strings (with or without 0x prefix)
      const hexStr = seedVal.startsWith('0x') ? seedVal.slice(2) : seedVal;
      // Use first 8 hex characters (32 bits) for seeding
      seedInt = parseInt(hexStr.slice(0, 8), 16);
    } else {
      seedInt = seedVal;
    }
      
    rngSeedRef.current = seedInt >>> 0;
    rngRef.current = mulberry32(seedInt);
  };

  const random = () => rngRef.current();
  const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    wheelStateRef.current = wheelState;
  }, [wheelState]);

  useEffect(() => {
    if (playerLockUntil > Date.now()) {
      const timeout = playerLockUntil - Date.now();
      const t = setTimeout(() => setPlayerLockUntil(0), timeout);
      return () => clearTimeout(t);
    }
  }, [playerLockUntil]);

  useEffect(() => {
    const handleMouseMove = (e) => setGameMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (cryptoState.phase !== 'playing') {
      setShotEffect(null);
      setEffectOverlay(null);
      setShell(null);
      if (dealerTimerRef.current) {
        clearTimeout(dealerTimerRef.current);
        dealerTimerRef.current = null;
      }
      setPlayerLockUntil(0);
      setWheelState({
        active: false,
        queue: [],
        pool: Object.keys(ITEM_CONFIG),
        spinning: false,
        rotation: 0,
        lastItem: null,
        currentOwner: null
      });
      spinLockRef.current = false; // Reset spin lock on phase change
    }
  }, [cryptoState.phase]);

  const calcDealerEyeOffset = (eyeOffsetX = 0) => {
    if (!gameEyesRef.current) return { x: 0, y: 0 };
    const rect = gameEyesRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + eyeOffsetX;
    const centerY = rect.top + rect.height / 2;
    const dx = gameMousePos.x - centerX;
    const dy = gameMousePos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const maxDist = 10;
    const dist = Math.min(Math.hypot(dx, dy) / 30, maxDist);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const setTelemetry = (message) => {
    setGameState(prev => ({
      ...prev,
      log: pushTelemetry(prev.log, message)
    }));
  };

  const triggerShell = (type, color = 'red') => {
    const id = `${rngSeedRef.current}-${Math.floor(random() * 1_000_000)}`;
    setShell({ type, id, color });
    setTimeout(() => {
      setShell(prev => (prev && prev.id === id ? null : prev));
    }, 800);
  };

  const spinWheel = (ownerOverride = null) => {
    // Use a ref-based lock to prevent double spins (React state update race condition)
    if (spinLockRef.current) {
      console.log('[SPIN] Blocked by spinLock');
      return;
    }
    
    // Read current wheel state from ref to avoid stale closures
    const currentWheel = wheelStateRef.current;
    if (!currentWheel || !currentWheel.active || currentWheel.spinning) {
      console.log('[SPIN] Blocked - active:', currentWheel?.active, 'spinning:', currentWheel?.spinning);
      return;
    }
    
    const owner = ownerOverride || currentWheel.currentOwner;
    if (!owner) {
      console.log('[SPIN] No owner');
      return;
    }
    
    // Verify the owner matches the expected next in queue
    if (currentWheel.queue.length > 0 && currentWheel.queue[0] !== owner) {
      console.log('[SPIN] Owner mismatch! Expected:', currentWheel.queue[0], 'Got:', owner);
      return;
    }
    
    const pool = currentWheel.pool.length ? currentWheel.pool : Object.keys(ITEM_CONFIG);
    if (!pool.length) return;
    
    // Acquire spin lock
    spinLockRef.current = true;
    console.log('[SPIN] Starting spin for:', owner, 'queue:', currentWheel.queue);
    
    // Calculate spin parameters
    const segmentAngle = 360 / pool.length;
    const contentOffset = segmentAngle / 2;
    const idx = Math.floor(random() * pool.length);
    const selectedKind = pool[idx];
    const itemAngle = (idx * segmentAngle) + contentOffset;
    const targetRotation = 360 - itemAngle;
    const noise = (random() - 0.5) * (segmentAngle * 0.4);
    const extraSpins = 5 * 360;
    const base = Math.ceil(currentWheel.rotation / 360) * 360;
    const rotation = base + extraSpins + targetRotation + noise;
    const startTurnForRound = currentWheel.startTurn || 'player';
    
    // Start the spin immediately
    setWheelState(prev => ({
      ...prev,
      spinning: true,
      lastItem: null,
      rotation,
      currentOwner: owner
    }));
    
    // After animation finishes (4 seconds), process the result
    setTimeout(() => {
      // Grant the item to the current owner
      console.log('[SPIN] Granting', selectedKind, 'to', owner);
      grantItemTo(owner, selectedKind);
      
      // Read latest wheel state to get current queue
      const latestWheel = wheelStateRef.current;
      if (!latestWheel) {
        spinLockRef.current = false;
        return;
      }
      
      // Advance the queue - remove the first entry (current spinner)
      const newQueue = latestWheel.queue.slice(1);
      const nextOwner = newQueue.length > 0 ? newQueue[0] : null;
      const willContinue = newQueue.length > 0;
      
      console.log('[SPIN] Complete. newQueue:', newQueue, 'nextOwner:', nextOwner, 'willContinue:', willContinue);
      
      // Set turn immediately based on game logic BEFORE wheel becomes inactive
      // This prevents player from interacting during the gap
      if (!willContinue) {
        // All spins done - set turn to startTurnForRound immediately
        setGameState(prev => {
          if (!prev.matchOver) {
            return {
              ...prev,
              currentTurn: startTurnForRound
            };
          }
          return prev;
        });
      } else {
        // More spins remaining - if next owner is dealer, set turn to dealer immediately
        // If next owner is player, keep turn as player (they'll spin again)
        if (nextOwner === 'dealer') {
          setGameState(prev => {
            if (!prev.matchOver) {
              return {
                ...prev,
                currentTurn: 'dealer'
              };
            }
            return prev;
          });
        } else if (nextOwner === 'player') {
          setGameState(prev => {
            if (!prev.matchOver && prev.currentTurn !== 'player') {
              return {
                ...prev,
                currentTurn: 'player'
              };
            }
            return prev;
          });
        }
      }
      
      // Update state to show the acquired item
      setWheelState(prev => ({
        ...prev,
        spinning: false,
        lastItem: selectedKind,
        // Pool stays the same for visual consistency
        queue: newQueue,
        currentOwner: nextOwner,
        active: willContinue
      }));
      
      // After showing the item briefly (1.5s), either continue to next spin or start round
      setTimeout(() => {
        // Release spin lock
        spinLockRef.current = false;
        
        setWheelState(prev => ({
          ...prev,
          lastItem: null
        }));
        
        // Check if we should continue spinning or start the next round
        // The turn has already been set above, so we just need to start the round if all spins are done
        if (!willContinue) {
          console.log('[SPIN] All spins done, starting next round');
          // Turn is already set to startTurnForRound above, just start the round
          setGameState(prevGame => startRoundFromState(prevGame, [], startTurnForRound));
        } else {
          console.log('[SPIN] More spins to go, nextOwner:', nextOwner);
          // Turn is already set above based on nextOwner
        }
      }, 1500);
    }, 4000);
  };

  const resolveSkips = (statusEffects, desiredNext) => {
    const updatedStatus = {
      player: { ...statusEffects.player },
      dealer: { ...statusEffects.dealer }
    };
    let next = desiredNext;
    const telemetry = [];
    let guard = 0;
    while (updatedStatus[next].skipTurnsRemaining > 0 && guard < 4) {
      updatedStatus[next].skipTurnsRemaining -= 1;
      telemetry.push(`${ACTOR_LABEL[next]} turn skipped`);
      next = next === 'player' ? 'dealer' : 'player';
      guard += 1;
    }
    return { updatedStatus, nextTurn: next, telemetry };
  };

const addItemsToInventory = (inventory, ownerKey, telemetry, count) => {
  let updated = [...inventory];
  for (let i = 0; i < count; i++) {
    const kind = pickWeightedItem(random);
    const item = buildItem(kind, random);
    if (item) updated.push(item);
  }
    let discarded = 0;
    while (updated.length > MAX_INVENTORY) {
      const idx = Math.floor(random() * updated.length);
      updated.splice(idx, 1);
      discarded += 1;
    }
    if (discarded) telemetry.push(`${ACTOR_LABEL[ownerKey]} inventory full → discarded ${discarded}`);
    return updated;
  };

  const startRoundFromState = (state, extraMessages = [], startTurn = 'player') => {
    const length = randomInt(2, 8);
    const liveCount = randomInt(1, length - 1);
    const blankCount = length - liveCount;
    const chamber = shuffleWith(
      [...Array(liveCount).fill('LIVE'), ...Array(blankCount).fill('BLANK')],
      random
    );
    const telemetry = [
      ...extraMessages,
      `R${state.round + 1} START: ${length} shells (${liveCount} LIVE / ${blankCount} BLANK)`
    ];

    const itemsToGive = state.itemsPerRound ?? 0;
    const nextItemsPerRound = Math.min(1, itemsToGive + 1);

    const { updatedStatus, nextTurn, telemetry: skipMessages } = resolveSkips(state.statusEffects, startTurn);

    // Reset temp effects at round start
    const initialTempEffects = freshTempEffects();

    return {
      ...state,
      round: state.round + 1,
      chamber,
      liveShells: liveCount,
      blankShells: blankCount,
      currentShellIndex: 0,
      knowledge: freshKnowledge(),
      tempEffects: initialTempEffects, // Reset temp effects at round start (with shield for match start)
      playerInventory: state.playerInventory,
      dealerInventory: state.dealerInventory,
      statusEffects: updatedStatus,
      currentTurn: nextTurn,
      log: pushTelemetry(state.log, [...telemetry, ...skipMessages]),
      itemsPerRound: nextItemsPerRound
    };
  };

  const handleRoundExhausted = (state) => {
    const telemetry = [`R${state.round} END: Reloading...`];
    return startRoundFromState(state, telemetry);
  };

  // --- UPDATED START GAME FUNCTION FOR PYTH ---
  const handleStartGame = async () => {
    const wager = 1;
    if (wager > cryptoState.balance) {
      setTelemetry("INSUFFICIENT FUNDS.");
      return;
    }

    if (!contractRef.current || !CONTRACT_CONFIG.address) {
      setTelemetry("CONTRACT NOT INITIALIZED.");
      return;
    }

    setIsContractLoading(true);
    setTelemetry("Initiating Contract & Pyth Entropy...");

    try {
      // 0. Check if contract is funded
      try {
        const canStart = await contractRef.current.canStartGame();
        if (!canStart) {
          const minBalance = await contractRef.current.getMinRequiredBalance();
          const minBalanceFormatted = parseFloat(ethers.formatEther(minBalance)).toFixed(2);
          setTelemetry(`ERROR: Contract needs funding. Send at least ${minBalanceFormatted} MON to contract address: ${CONTRACT_CONFIG.address}`);
          setIsContractLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not check if contract can start game", err);
      }

      // 1. Get Entropy Fee
      let entropyFee = ethers.parseEther("0.001"); // Fallback buffer
      try {
        entropyFee = await contractRef.current.getEntropyFee();
      } catch (err) {
        if (err.reason && err.reason.includes("Entropy provider not configured")) {
          setTelemetry("ERROR: Entropy provider not configured. Contract owner must call initializeEntropyProvider() first.");
          setIsContractLoading(false);
          return;
        }
        console.warn("Could not fetch entropy fee, using fallback", err);
      }

      const playFee = ethers.parseEther("1.0");
      const totalVal = playFee + entropyFee;

      // 2. Call Start Game
      const tx = await contractRef.current.startGame({ value: totalVal });
      setTelemetry("Transaction Sent. Requesting Randomness...");
      setEntropyStatus('requesting');
      
      await tx.wait();
      setTelemetry("Payment Confirmed. Waiting for Pyth...");
      setEntropyStatus('waiting');

      // Update balance after payment
      if (providerRef.current) {
        const balance = await providerRef.current.getBalance(cryptoState.walletAddress);
        setCryptoState(prev => ({
          ...prev,
          balance: parseFloat(ethers.formatEther(balance))
        }));
      }

      // Immediate check - callback might have already completed
      try {
        const isPending = await contractRef.current.isGamePending(cryptoState.walletAddress);
        if (!isPending) {
          const seed = await contractRef.current.getBaseSeed(cryptoState.walletAddress);
          if (seed && seed !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            // Callback already completed!
            reseed(seed);
            const baseState = createInitialGameState(seed);
            const nextState = startRoundFromState(baseState, [`SECURE LINK ESTABLISHED: ${seed.slice(0, 10)}...`]);

            setCryptoState(prev => ({
              ...prev,
              currentWager: wager,
              multiplier: 1.2,
              phase: 'playing'
            }));
            
            setGameState(nextState);
            setIsSawedOff(false);
            setShotEffect(null);
            rewardClaimedRef.current = false;
            setIsContractLoading(false);
            setEntropyStatus('received');
            return; // Exit early, game already started
          }
        }
      } catch (e) {
        console.warn("Error checking immediate game status:", e);
      }

      // 3. Listen for GameReady Event and poll for game status
      const filter = contractRef.current.filters.GameReady(cryptoState.walletAddress);
      let cleanupDone = false;
      
      // Declare variables that will be used in closures
      let pollInterval;
      let timeoutId;
      
      // Helper function to start the game with seed
      const startGameWithSeed = async (seed) => {
        if (cleanupDone) return;
        cleanupDone = true;
        console.log("Entropy Received! Seed:", seed);
        
        // Clean up listener and interval
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutId) clearTimeout(timeoutId);
        contractRef.current.off(filter, onGameReady);
        
        // Start Game with Secure Seed
        reseed(seed);
        const baseState = createInitialGameState(seed);
        const nextState = startRoundFromState(baseState, [`SECURE LINK ESTABLISHED: ${seed.slice(0, 10)}...`]);

        // Register game with server to get gameId
        try {
          const serverResponse = await fetch(`${SERVER_URL}/api/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerAddress: cryptoState.walletAddress,
              baseSeed: seed
            })
          });
          
          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            gameIdRef.current = serverData.gameId;
            console.log('Game registered with server. GameId:', serverData.gameId);
          } else {
            console.warn('Failed to register game with server:', await serverResponse.text());
          }
        } catch (error) {
          console.warn('Error registering game with server:', error);
          // Continue anyway - server registration is for claim verification
        }

        setCryptoState(prev => ({
          ...prev,
          currentWager: wager,
          multiplier: 1.2,
          phase: 'playing'
        }));
        
        setGameState(nextState);
        setIsSawedOff(false);
        setShotEffect(null);
        rewardClaimedRef.current = false;
        setIsContractLoading(false);
        setEntropyStatus('received');
      };

      // Event listener function
      const onGameReady = (player, seed) => {
        if (player.toLowerCase() === cryptoState.walletAddress.toLowerCase() && !cleanupDone) {
          startGameWithSeed(seed);
        }
      };

      // Set up event listener
      contractRef.current.on(filter, onGameReady);

      // Polling to check if game is ready (more reliable than events)
      pollInterval = setInterval(async () => {
        if (cleanupDone) return;
        try {
          // Check if game is no longer pending (entropy callback received)
          const isPending = await contractRef.current.isGamePending(cryptoState.walletAddress);
          if (!isPending) {
            // Game is ready, get the seed directly from contract
            const seed = await contractRef.current.getBaseSeed(cryptoState.walletAddress);
            if (seed && seed !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              // Clean up and start game
              startGameWithSeed(seed);
            }
          }
        } catch(e) {
          console.warn("Error polling game status:", e);
        }
      }, 2000);

      // Also listen for past events (in case we missed it)
      try {
        const pastEvents = await contractRef.current.queryFilter(
          filter,
          tx.blockNumber - 10, // Check last 10 blocks
          'latest'
        );
        if (pastEvents.length > 0) {
          const latestEvent = pastEvents[pastEvents.length - 1];
          if (latestEvent.args && latestEvent.args[0].toLowerCase() === cryptoState.walletAddress.toLowerCase()) {
            startGameWithSeed(latestEvent.args[1]); // seed is the second argument
            return; // Exit early
          }
        }
      } catch (e) {
        console.warn("Error querying past events:", e);
      }

      // Cleanup timeout (if Pyth fails to callback in 90s)
      timeoutId = setTimeout(() => {
        if (!cleanupDone) {
          cleanupDone = true;
          if (pollInterval) clearInterval(pollInterval);
          contractRef.current.off(filter, onGameReady);
          setTelemetry("Entropy timeout. The callback may have succeeded - check Pyth explorer. You can try refreshing.");
          setIsContractLoading(false);
          setEntropyStatus(null);
        }
      }, 90000); // Increased to 90s since Pyth can take time

    } catch (error) {
      console.error('Error starting game:', error);
      
      // Check for specific error messages
      const errorMessage = error.reason || error.message || "Failed to start game.";
      if (errorMessage.includes("Entropy provider not configured")) {
        setTelemetry("ERROR: Entropy provider not configured. Contract owner must call initializeEntropyProvider() in Remix or via MetaMask.");
      } else {
        setTelemetry(errorMessage);
      }
      
      setIsContractLoading(false);
      setEntropyStatus(null);
    }
  };

  const handleCashOut = () => {
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
        phase: 'main_menu',
        multiplier: 1.0
    }));
    const seed = rngSeedRef.current;
    const resetState = startRoundFromState(createInitialGameState(seed));
    setGameState(resetState);
  };

  const handleContinue = () => {};

  const concludeMatchIfNeeded = (state, telemetry) => {
    let nextState = { ...state };
    if (state.dealerHealth <= 0) {
      nextState.matchOver = true;
      nextState.lastOutcome = 'player';
      telemetry.push("MATCH OVER: You win");
      
      // Only claim reward once per game
      if (!rewardClaimedRef.current) {
        rewardClaimedRef.current = true;
        
        // Show game over screen immediately
        setAimingAt(null);
        setCryptoState(prev => ({ ...prev, phase: 'game_over' }));
        
        // Fetch RNG data and claim reward in background (async, no delay)
        (async () => {
          // Claim win reward from contract (requires server signature)
          if (!contractRef.current) {
            setTelemetry("Error: Contract not connected");
            setIsContractLoading(false);
            return;
          }
          
          // If gameId is missing, try to get baseSeed and register with server
          if (!gameIdRef.current) {
            try {
              setTelemetry("Registering game with server...");
              const baseSeed = await contractRef.current.getBaseSeed(cryptoState.walletAddress);
              if (baseSeed && baseSeed !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                const serverResponse = await fetch(`${SERVER_URL}/api/game/start`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    playerAddress: cryptoState.walletAddress,
                    baseSeed: baseSeed
                  })
                });
                
                if (serverResponse.ok) {
                  const serverData = await serverResponse.json();
                  gameIdRef.current = serverData.gameId;
                  console.log('Game registered with server. GameId:', serverData.gameId);
                } else {
                  throw new Error('Failed to register game with server');
                }
              } else {
                throw new Error('No active game found');
              }
            } catch (error) {
              console.error('Error registering game:', error);
              setTelemetry("Error: Game not registered with server. Cannot claim reward.");
              setIsContractLoading(false);
              return;
            }
          }
          
          if (contractRef.current && gameIdRef.current) {
            try {
              setIsContractLoading(true);
              setTelemetry("Requesting server signature...");
              
              // End the game on server to get end block and RNG data
              const endResponse = await fetch(`${SERVER_URL}/api/game/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  playerAddress: cryptoState.walletAddress,
                  gameId: gameIdRef.current
                })
              });
              
              if (!endResponse.ok) {
                const errorData = await endResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to end game on server');
              }
              
              const endData = await endResponse.json();
              
              // Store RNG data for verification
              try {
                const verification = verifyRNGComponents(endData, cryptoState.walletAddress);
                
                // Verify base seed matches contract
                if (contractRef.current) {
                  const baseSeedValid = await verifyBaseSeed(
                    endData.baseSeed,
                    CONTRACT_CONFIG.address,
                    cryptoState.walletAddress,
                    contractRef.current
                  );
                  verification.baseSeedValid = baseSeedValid;
                }
                
                setRngVerificationData({
                  ...endData,
                  verification,
                  formatted: formatRNGData(endData)
                });
              } catch (error) {
                console.warn('Error verifying RNG data:', error);
                // Continue with claim even if verification fails
              }
              
              // Get signature from server
              const signResponse = await fetch(`${SERVER_URL}/api/game/verify-and-sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  playerAddress: cryptoState.walletAddress,
                  gameId: gameIdRef.current,
                  finalPlayerHealth: state.playerHealth,
                  finalDealerHealth: state.dealerHealth
                })
              });
              
              if (!signResponse.ok) {
                const errorData = await signResponse.json();
                throw new Error(errorData.error || 'Failed to get server signature');
              }
              
              const signData = await signResponse.json();
              
              // Now claim on contract with signature
              setTelemetry("Claiming reward on-chain...");
              const tx = await contractRef.current.claimWin(
                state.playerHealth,
                state.dealerHealth,
                signData.result.rngCommitment, // RNG commitment (used as gameSeed for signature verification)
                endData.endBlockNumber,
                signData.signature
              );
              
              await tx.wait();
              
              // Update balance after receiving reward
              if (providerRef.current) {
                const balance = await providerRef.current.getBalance(cryptoState.walletAddress);
                setCryptoState(prev => ({
                  ...prev,
                  balance: parseFloat(ethers.formatEther(balance))
                }));
              }
              setTelemetry("Reward claimed: +2 MON");
              gameIdRef.current = null; // Clear gameId
            } catch (error) {
              console.error('Error claiming win:', error);
              if (error.message) {
                setTelemetry(`Error: ${error.message}`);
              } else if (error.reason) {
                setTelemetry(`Error claiming reward: ${error.reason}`);
              } else {
                setTelemetry("Failed to claim reward. Please try again.");
              }
            } finally {
              setIsContractLoading(false);
            }
          } else {
            setTelemetry("Error: Game ID not found. Cannot claim reward.");
          }
        })();
      }
    } else if (state.playerHealth <= 0) {
      nextState.matchOver = true;
      nextState.lastOutcome = 'dealer';
      telemetry.push("MATCH OVER: Dealer wins");
      
      // Only end game once
      if (!rewardClaimedRef.current) {
        rewardClaimedRef.current = true;
        
        // Show game over screen immediately
        setAimingAt(null);
        setCryptoState(prev => ({ ...prev, phase: 'game_over' }));
        
        // Fetch RNG verification data in background (async, no delay)
        (async () => {
          // Fetch RNG verification data (even on loss)
          if (gameIdRef.current) {
            try {
              const endResponse = await fetch(`${SERVER_URL}/api/game/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  playerAddress: cryptoState.walletAddress,
                  gameId: gameIdRef.current
                })
              });
              
              if (endResponse.ok) {
                const rngData = await endResponse.json();
                try {
                  const verification = verifyRNGComponents(rngData, cryptoState.walletAddress);
                  
                  // Verify base seed matches contract
                  if (contractRef.current) {
                    const baseSeedValid = await verifyBaseSeed(
                      rngData.baseSeed,
                      CONTRACT_CONFIG.address,
                      cryptoState.walletAddress,
                      contractRef.current
                    );
                    verification.baseSeedValid = baseSeedValid;
                  }
                  
                  setRngVerificationData({
                    ...rngData,
                    verification,
                    formatted: formatRNGData(rngData)
                  });
                } catch (error) {
                  console.warn('Error verifying RNG data:', error);
                  // Still set the data even if verification fails
                  try {
                    setRngVerificationData({
                      ...rngData,
                      verification: { isValid: false, error: error.message },
                      formatted: formatRNGData(rngData)
                    });
                  } catch (formatError) {
                    console.warn('Error formatting RNG data:', formatError);
                  }
                }
              }
            } catch (error) {
              console.warn('Error fetching RNG data:', error);
            }
          }
          
          // No need to call endGame() - contract will auto-clear on next startGame()
          setTelemetry("Game ended. You can start a new game when ready.");
        })();
      }
    }
    return nextState;
  };

  const resolveShot = (shooter, target) => {
    // Calculate damage info before state update to determine if we should show overlay
    const currentState = gameStateRef.current || gameState;
    let showDamageOverlay = false;
    
    if (currentState && currentState.chamber && currentState.chamber.length > 0 && 
        currentState.currentShellIndex < currentState.chamber.length) {
      const shellType = currentState.chamber[currentState.currentShellIndex];
      const isLive = shellType === 'LIVE';
      
      if (isLive && target === 'player') {
        let damage = 1;
        if (currentState.tempEffects?.[shooter]?.doubleDamageNextShot) {
          damage = 2;
        }
        
        // Account for shield
        if (damage > 0 && currentState.tempEffects?.[target]?.shieldNextDamage > 0) {
          const shieldAmount = Math.min(damage, currentState.tempEffects[target].shieldNextDamage);
          damage -= shieldAmount;
        }
        
        showDamageOverlay = damage > 0;
      }
    }
    
    setGameState(prev => {
      if (cryptoState.phase !== 'playing' || prev.matchOver) return prev;
      if (prev.currentTurn !== shooter) return prev;

    if (!prev.chamber.length || prev.currentShellIndex >= prev.chamber.length) {
        return handleRoundExhausted(prev);
      }

      const shellType = prev.chamber[prev.currentShellIndex];
      const isLive = shellType === 'LIVE';
      const targetKey = target === 'player' ? 'playerHealth' : 'dealerHealth';
      const opponent = shooter === 'player' ? 'dealer' : 'player';
      const telemetry = [];

      const tempEffects = {
        ...prev.tempEffects,
        [shooter]: { ...prev.tempEffects[shooter], doubleDamageNextShot: false },
        [target]: { ...prev.tempEffects[target] }
      };

      let damage = isLive ? 1 : 0;
      if (isLive && prev.tempEffects[shooter]?.doubleDamageNextShot) {
        damage = 2;
      }
      
      // Duct Tape: Negate damage if target has shield active
      if (isLive && damage > 0 && prev.tempEffects[target]?.shieldNextDamage > 0) {
        const shieldAmount = Math.min(damage, prev.tempEffects[target].shieldNextDamage);
        damage -= shieldAmount;
        tempEffects[target].shieldNextDamage = prev.tempEffects[target].shieldNextDamage - shieldAmount;
        telemetry.push(`${ACTOR_LABEL[target]}: Duct Tape blocked ${shieldAmount} damage!`);
      }

      const statusEffects = {
        player: { ...prev.statusEffects.player },
        dealer: { ...prev.statusEffects.dealer }
      };

      const knowledge = freshKnowledge();
      const liveShells = isLive ? prev.liveShells - 1 : prev.liveShells;
      const blankShells = !isLive ? prev.blankShells - 1 : prev.blankShells;
      const currentShellIndex = prev.currentShellIndex + 1;

      const newHp = clampHp(prev[targetKey] - damage);
      let nextState = {
        ...prev,
        [targetKey]: newHp,
        tempEffects,
        statusEffects,
        knowledge,
        liveShells,
        blankShells,
        currentShellIndex
      };

      telemetry.push(
        `${ACTOR_LABEL[shooter]}: Shoot ${ACTOR_LABEL[target]} -> ${isLive ? 'LIVE' : 'BLANK'}${isLive ? ` (-${damage}). ${ACTOR_LABEL[target]} HP ${newHp}` : ''}`
      );

      if (!isLive && shooter === target) {
        nextState.statusEffects[opponent].skipTurnsRemaining += 1;
        telemetry.push(`SELF BLANK: ${ACTOR_LABEL[opponent]} skips next turn`);
      } else {
        // No skip for other cases
      }

      nextState = concludeMatchIfNeeded(nextState, telemetry);

      if (!nextState.matchOver && currentShellIndex >= prev.chamber.length) {
        // Use the same turn resolution logic as normal shots (includes skip handling)
        const desiredNext = shooter === 'player' ? 'dealer' : 'player';
        const { updatedStatus, nextTurn, telemetry: skipTelemetry } = resolveSkips(nextState.statusEffects, desiredNext);
        
        // Determine who spins first based on the resolved next turn
        const firstSpinner = nextTurn; // Person who gets the next turn spins first
        const secondSpinner = firstSpinner === 'player' ? 'dealer' : 'player'; // Other person spins second
        
        // Reset status effects for the new round (skips are consumed/reset)
        nextState.statusEffects = freshStatus();
        nextState.currentTurn = nextTurn;
        nextState.log = pushTelemetry(prev.log, [...telemetry, ...skipTelemetry, `R${prev.round} END: Reloading...`]);
        
        // Prepare wheel spins before starting next round
        // Ensure exactly 1 item per actor (player and dealer each get 1 item)
        const spinsPerActor = Math.min(1, nextState.itemsPerRound ?? 0); // Cap at 1 to ensure only 1 item per actor
        if (spinsPerActor > 0) {
          // Build queue with exactly 1 spin for each actor
          const queue = [firstSpinner, secondSpinner]; // Exactly 2 entries = 1 per actor
          console.log('[WHEEL] Queue built:', queue, 'spinsPerActor:', spinsPerActor, 'shooter:', shooter, 'nextTurn:', nextTurn, 'isLive:', isLive);
          // Delay before showing wheel and reset aim
          setTimeout(() => {
            setAimingAt(null);
            setWheelState({
              active: true,
              queue,
              pool: Object.keys(ITEM_CONFIG),
              spinning: false,
              rotation: 0,
              lastItem: null,
              currentOwner: queue[0] || null,
              startTurn: nextTurn
            });
            spinLockRef.current = false; // Ensure lock is clear when wheel opens
          }, 1000);
          return nextState; // wheel will continue flow after delay
        }
        nextState = startRoundFromState(nextState, [], nextTurn);
      } else {
        const desiredNext = shooter === 'player' ? 'dealer' : 'player';
        const { updatedStatus, nextTurn, telemetry: skipTelemetry } = resolveSkips(nextState.statusEffects, desiredNext);
        nextState.statusEffects = updatedStatus;
        nextState.currentTurn = nextState.matchOver ? prev.currentTurn : nextTurn;
        nextState.log = pushTelemetry(prev.log, [...telemetry, ...skipTelemetry]);
      }

      const color = isLive ? 'red' : 'white';
      triggerShell(target === 'dealer' ? 'dealer' : 'self', color);
      setShotEffect(isLive ? (target === 'dealer' ? 'dealer' : 'self') : null);
      
      setTimeout(() => {
        setShotEffect(null);
        setAimingAt(null);
        if (shooter === 'player') setIsSawedOff(false);
      }, 2000);
      if (shooter === 'dealer') {
        setPlayerLockUntil(Date.now() + 2000);
      }
      return nextState;
    });
    
    // Show damage overlay when player takes damage (outside state update to avoid batching issues)
    // Use a small delay to ensure it runs after React processes the state update
    if (showDamageOverlay) {
      setTimeout(() => {
        setEffectOverlay('damage');
        setTimeout(() => setEffectOverlay(null), 1000);
      }, 50);
    }
  };

  const removeItemFromInventory = (inventory, id) => inventory.filter(it => it.id !== id);

  const grantItemTo = (owner, kind) => {
    console.log('[GRANT] Granting', kind, 'to', owner);
    setGameState(prev => {
      const telemetry = [];
      const inventoryKey = owner === 'player' ? 'playerInventory' : 'dealerInventory';
      const item = buildItem(kind, random);
      if (!item) return prev;
      const prevCount = prev[inventoryKey].length;
      let nextInventory = [...prev[inventoryKey], item];
      let discarded = 0;
      while (nextInventory.length > MAX_INVENTORY) {
        nextInventory.shift();
        discarded += 1;
      }
      if (discarded) telemetry.push(`${ACTOR_LABEL[owner]} inventory full → discarded ${discarded}`);
      const trimmed = nextInventory;
      console.log('[GRANT] Done:', owner, 'inventory:', prevCount, '->', trimmed.length);
      return {
        ...prev,
        [inventoryKey]: trimmed,
        log: pushTelemetry(prev.log, [`${ACTOR_LABEL[owner]} wheel: ${ITEM_CONFIG[kind].label}`])
      };
    });
  };

  const handleItemUse = (actor, item) => {
    const opponent = actor === 'player' ? 'dealer' : 'player';
    setGameState(prev => {
      if (cryptoState.phase !== 'playing' || prev.matchOver) return prev;
      if (prev.currentTurn !== actor) return prev;

      const telemetry = [];
      const statusEffects = {
        player: { ...prev.statusEffects.player },
        dealer: { ...prev.statusEffects.dealer }
      };
      const tempEffects = {
        player: { ...prev.tempEffects.player },
        dealer: { ...prev.tempEffects.dealer }
      };
      let knowledge = { ...prev.knowledge };
      let liveShells = prev.liveShells;
      let blankShells = prev.blankShells;
      let currentShellIndex = prev.currentShellIndex;
      let playerHealth = prev.playerHealth;
      let dealerHealth = prev.dealerHealth;
      let keepTurn = actor === 'dealer'; // dealer keeps turn after item use; player keeps by default elsewhere

      const applyInventory = (key) => {
        if (key === 'player') {
          return removeItemFromInventory(prev.playerInventory, item.id);
        }
        return removeItemFromInventory(prev.dealerInventory, item.id);
      };

      let playerInventory = prev.playerInventory;
      let dealerInventory = prev.dealerInventory;
      if (actor === 'player') {
        playerInventory = applyInventory('player');
        keepTurn = true; // Player keeps turn after using an item; dealer acts after the next shot
      } else {
        dealerInventory = applyInventory('dealer');
      }

      const remainingShells = prev.chamber.length - prev.currentShellIndex;
      const currentShellType = prev.chamber[prev.currentShellIndex];
      let chamber = prev.chamber; // May be modified by Inverter

      switch (item.kind) {
        case 'CIGARETTES': {
          const isPlayer = actor === 'player';
          const newHp = clampHp(isPlayer ? playerHealth + 1 : dealerHealth + 1);
          if (isPlayer) {
            playerHealth = newHp;
            setEffectOverlay('smoke');
            setTimeout(() => setEffectOverlay(null), 1500);
          } else {
            dealerHealth = newHp;
          }
          telemetry.push(`${ACTOR_LABEL[actor]}: Cigarettes → HP ${newHp}`);
          break;
        }
        case 'HAND_SAW': {
          tempEffects[actor].doubleDamageNextShot = true;
          telemetry.push(`${ACTOR_LABEL[actor]}: Hand Saw primed`);
          if (actor === 'player') {
            setEffectOverlay('sawing');
            setTimeout(() => setEffectOverlay(null), 1200);
            setIsSawedOff(true);
          }
          break;
        }
        case 'MAGNIFYING_GLASS': {
          if (remainingShells <= 0) {
            telemetry.push(`${ACTOR_LABEL[actor]}: Glass → chamber empty`);
          } else {
            knowledge = {
              ...knowledge,
              [actor]: {
                currentShellKnown: true,
                knownCurrentShellType: currentShellType
              }
            };
            if (actor === 'player') {
              telemetry.push(`${ACTOR_LABEL[actor]}: Glass → ${currentShellType}`);
              setScanningShell(currentShellType === 'LIVE' ? 'live' : 'blank');
              setTimeout(() => setScanningShell(null), 1500);
            } else {
              telemetry.push(`${ACTOR_LABEL[actor]}: Glass used`);
            }
          }
          break;
        }
        case 'BEER': {
          if (remainingShells <= 0) {
            telemetry.push(`${ACTOR_LABEL[actor]}: Beer wasted (empty)`);
          } else {
            const isLive = currentShellType === 'LIVE';
            liveShells = isLive ? prev.liveShells - 1 : prev.liveShells;
            blankShells = !isLive ? prev.blankShells - 1 : prev.blankShells;
            currentShellIndex = prev.currentShellIndex + 1;
            knowledge = freshKnowledge();
            const shellsLeft = prev.chamber.length - currentShellIndex;
            telemetry.push(`${ACTOR_LABEL[actor]}: Beer → racked a shell (${shellsLeft} left)`);
            triggerShell('side', isLive ? 'red' : 'white');
          }
          keepTurn = true;
          break;
        }
        case 'SKIP': {
          statusEffects[opponent].skipTurnsRemaining += 1;
          telemetry.push(`${ACTOR_LABEL[actor]}: Skip → ${ACTOR_LABEL[opponent]} loses a turn`);
          break;
        }
        case 'SHIELD': {
          // Add shield to block next 1 damage
          tempEffects[actor] = { ...tempEffects[actor], shieldNextDamage: (tempEffects[actor]?.shieldNextDamage || 0) + 1 };
          telemetry.push(`${ACTOR_LABEL[actor]}: Shield → blocked for 1 damage`);
          if (actor === 'player') {
            setEffectOverlay('shield');
            setTimeout(() => setEffectOverlay(null), 1000);
          }
          break;
        }
        case 'SHAKE_DOWN': {
          // Remove random item from opponent
          const opponentInventoryKey = opponent === 'player' ? 'playerInventory' : 'dealerInventory';
          const opponentItems = opponent === 'player' ? playerInventory : dealerInventory;
          if (opponentItems.length === 0) {
            telemetry.push(`${ACTOR_LABEL[actor]}: Shake Down → ${ACTOR_LABEL[opponent]} has no items!`);
          } else {
            const idx = Math.floor(random() * opponentItems.length);
            const removedItem = opponentItems[idx];
            const newOpponentInventory = opponentItems.filter((_, i) => i !== idx);
            if (opponent === 'player') {
              playerInventory = newOpponentInventory;
            } else {
              dealerInventory = newOpponentInventory;
            }
            telemetry.push(`${ACTOR_LABEL[actor]}: Shake Down → destroyed ${ACTOR_LABEL[opponent]}'s ${ITEM_CONFIG[removedItem.kind]?.label || 'item'}`);
          }
          break;
        }
        case 'STEAL': {
          // Steal random item from opponent
          const stealOpponentKey = opponent === 'player' ? 'playerInventory' : 'dealerInventory';
          const stealOpponentItems = opponent === 'player' ? playerInventory : dealerInventory;
          const actorItems = actor === 'player' ? playerInventory : dealerInventory;
          if (stealOpponentItems.length === 0) {
            telemetry.push(`${ACTOR_LABEL[actor]}: Steal → ${ACTOR_LABEL[opponent]} has no items!`);
          } else {
            const stealIdx = Math.floor(random() * stealOpponentItems.length);
            const stolenItem = stealOpponentItems[stealIdx];
            const newStealOpponentInventory = stealOpponentItems.filter((_, i) => i !== stealIdx);
            let newActorInventory = [...actorItems, stolenItem];
            
            // If actor would exceed max, discard oldest to make room
            while (newActorInventory.length > MAX_INVENTORY) {
              newActorInventory.shift();
              telemetry.push(`${ACTOR_LABEL[actor]}: Inventory full → discarded oldest item`);
            }
            
            if (opponent === 'player') {
              playerInventory = newStealOpponentInventory;
            } else {
              dealerInventory = newStealOpponentInventory;
            }
            if (actor === 'player') {
              playerInventory = newActorInventory;
            } else {
              dealerInventory = newActorInventory;
            }
            telemetry.push(`${ACTOR_LABEL[actor]}: Steal → stole ${ITEM_CONFIG[stolenItem.kind]?.label || 'item'} from ${ACTOR_LABEL[opponent]}`);
          }
          break;
        }
        case 'INVERTER': {
          // Swap current shell polarity (LIVE <-> BLANK)
          if (remainingShells <= 0) {
            telemetry.push(`${ACTOR_LABEL[actor]}: Inverter → chamber empty`);
          } else {
            const oldType = currentShellType;
            const newType = oldType === 'LIVE' ? 'BLANK' : 'LIVE';
            // Modify chamber - create new array with swapped shell
            chamber = [...prev.chamber];
            chamber[prev.currentShellIndex] = newType;
            // Update shell counts
            if (oldType === 'LIVE') {
              liveShells = prev.liveShells - 1;
              blankShells = prev.blankShells + 1;
            } else {
              liveShells = prev.liveShells + 1;
              blankShells = prev.blankShells - 1;
            }
            // Reset knowledge since shell changed
            knowledge = freshKnowledge();
            telemetry.push(`${ACTOR_LABEL[actor]}: Inverter → shell polarity swapped`);
          }
          break;
        }
        case 'RANDOM_PILL': {
          // 50% chance to heal 2 HP or take 1 damage
          const pillRoll = random();
          const isPlayer = actor === 'player';
          if (pillRoll < 0.5) {
            // Heal 2 HP (capped at max)
            const newHp = clampHp((isPlayer ? playerHealth : dealerHealth) + 2);
            if (isPlayer) {
              playerHealth = newHp;
            } else {
              dealerHealth = newHp;
            }
            telemetry.push(`${ACTOR_LABEL[actor]}: Random Pill → healed 2 HP! (now ${newHp})`);
            if (isPlayer) {
              setEffectOverlay('heal');
              setTimeout(() => setEffectOverlay(null), 1000);
            }
          } else {
            // Take 1 damage
            const newHp = clampHp((isPlayer ? playerHealth : dealerHealth) - 1);
            if (isPlayer) {
              playerHealth = newHp;
            } else {
              dealerHealth = newHp;
            }
            telemetry.push(`${ACTOR_LABEL[actor]}: Random Pill → took 1 damage! (now ${newHp})`);
            if (isPlayer) {
              setEffectOverlay('damage');
              setTimeout(() => setEffectOverlay(null), 1000);
            }
          }
          break;
        }
        default:
          break;
      }

      let nextState = {
        ...prev,
        chamber,
        playerInventory,
        dealerInventory,
        statusEffects,
        tempEffects,
        knowledge,
        liveShells,
        blankShells,
        currentShellIndex,
        playerHealth,
        dealerHealth
      };

      // Check for match conclusion (Random Pill can kill)
      nextState = concludeMatchIfNeeded(nextState, telemetry);
      if (nextState.matchOver) {
        nextState.log = pushTelemetry(prev.log, telemetry);
        return nextState;
      }

      if (currentShellIndex >= prev.chamber.length && prev.chamber.length > 0) {
        nextState.log = pushTelemetry(prev.log, [...telemetry, `R${prev.round} END: Reloading...`]);
        nextState = startRoundFromState(nextState);
        nextState.currentTurn = 'player';
        return nextState;
      }

      const desiredNext = keepTurn ? actor : (actor === 'player' ? 'dealer' : 'player');
      const { updatedStatus, nextTurn, telemetry: skipTelemetry } = resolveSkips(statusEffects, desiredNext);
      nextState.statusEffects = updatedStatus;
      nextState.currentTurn = nextTurn;
      nextState.log = pushTelemetry(prev.log, [...telemetry, ...skipTelemetry]);
      return nextState;
    });
  };

  const handleShootSelf = () => {
    setSuppressHoverAim(true);
    setAimingAt('self');
    setTimeout(() => setSuppressHoverAim(false), 2000);
    resolveShot('player', 'player');
  };
  const handleShootDealer = () => {
    setSuppressHoverAim(true);
    setAimingAt('dealer');
    setTimeout(() => setSuppressHoverAim(false), 2000);
    resolveShot('player', 'dealer');
  };
  const handleUseItem = (item) => {
    if (!item) return;
    // Clear hover state immediately when item is used
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredInventoryItem(null);
    handleItemUse('player', item);
  };

  const isSawAnimating = effectOverlay === 'sawing';
  const isPlayerTurn = cryptoState.phase === 'playing' && gameState.currentTurn === 'player' && !gameState.matchOver && !(playerLockUntil > Date.now()) && !isSawAnimating && !wheelState.active;
  const turnLabel = cryptoState.phase === 'playing'
    ? (gameState.currentTurn === 'player' ? 'Your Turn' : 'Dealer Turn')
    : null;
  const pendingPlayerSkips = gameState.statusEffects?.player?.skipTurnsRemaining || 0;
  const pendingDealerSkips = gameState.statusEffects?.dealer?.skipTurnsRemaining || 0;
  const remainingSpins = wheelState.queue.length;

  const dealerTakeTurn = () => {
    const latest = gameStateRef.current || gameState;
    if (cryptoState.phase !== 'playing' || latest.matchOver) return;
    if (latest.currentTurn !== 'dealer') return;
    if (wheelState.active) return;

    const remaining = latest.chamber.length - latest.currentShellIndex;
    if (remaining <= 0) {
      setGameState(prev => handleRoundExhausted(prev));
      return;
    }

    const findItem = (kind) => {
      const current = gameStateRef.current || latest;
      return current.dealerInventory.find(it => it.kind === kind);
    };
    const hasItem = (kind) => !!findItem(kind);

    const runIfDealerTurn = (fn) => {
      const current = gameStateRef.current || latest;
      if (cryptoState.phase !== 'playing') return false;
      if (current.matchOver || current.currentTurn !== 'dealer') return false;
      fn();
      return true;
    };

    const useItem = (kind) => {
      const item = findItem(kind);
      if (item) {
        return runIfDealerTurn(() => handleItemUse('dealer', item));
      }
      return false;
    };

    const aimAndShoot = (targetKey) => {
      const aimTarget = targetKey === 'dealer' ? 'dealer' : 'self';
      runIfDealerTurn(() => {
        setAimingAt(aimTarget);
        setSuppressHoverAim(true);
        setTimeout(() => {
          setSuppressHoverAim(false);
          const current = gameStateRef.current || latest;
          if (cryptoState.phase !== 'playing') return;
          if (current.matchOver || current.currentTurn !== 'dealer') return;
          resolveShot('dealer', targetKey);
        }, 2000);
      });
    };

    const current = gameStateRef.current || latest;
    const knownShell = current.knowledge.dealer.currentShellKnown ? current.knowledge.dealer.knownCurrentShellType : null;
    const pLive = remaining > 0 ? current.liveShells / remaining : 0;
    const hpAdvantage = current.dealerHealth - current.playerHealth;
    const canKillPlayer = current.playerHealth <= 2;
    const isDealerLow = current.dealerHealth <= 2;
    const isDealerCritical = current.dealerHealth <= 1;

    // ===== CRITICAL SURVIVAL PRIORITIES =====
    // If dealer is at 1 HP, prioritize survival above all else
    if (isDealerCritical) {
      // Heal if possible
      if (useItem('CIGARETTES')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If we know it's live and can't heal, try to invert it to blank and shoot self
      if (knownShell === 'LIVE' && hasItem('INVERTER') && useItem('INVERTER')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If unknown but high live odds, use Beer to eject dangerous shell
      if (!knownShell && pLive > 0.6 && useItem('BEER')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If known live and no escape, use Shield as last resort
      if (knownShell === 'LIVE' && hasItem('SHIELD') && useItem('SHIELD')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If unknown and high live odds, use Shield
      if (!knownShell && pLive >= 0.5 && hasItem('SHIELD') && useItem('SHIELD')) {
        scheduleDealerTurnDelay();
        return;
      }
    }

    // ===== KNOWN SHELL LOGIC =====
    // Known blank: ALWAYS shoot self to get skip (blanks don't damage player)
    if (knownShell === 'BLANK') {
      // Exception: If player is at 1 HP and we have Inverter, turn blank into live for kill
      if (current.playerHealth === 1 && hasItem('INVERTER') && useItem('INVERTER')) {
        scheduleDealerTurnDelay();
        return;
      }
      // Always shoot self with blank to get skip turn advantage
      aimAndShoot('dealer');
      return;
    }

    // Known live: offensive play
    if (knownShell === 'LIVE') {
      // If dealer is low HP, try to invert to blank and shoot self for skip
      if (isDealerCritical && hasItem('INVERTER') && useItem('INVERTER')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If we can kill player (2 HP or less), use Hand Saw for double damage
      if (canKillPlayer && hasItem('HAND_SAW') && useItem('HAND_SAW')) {
        scheduleDealerTurnDelay();
        return;
      }
      // If player has HP advantage and might retaliate, use Shield
      if (hpAdvantage < 0 && hasItem('SHIELD') && useItem('SHIELD')) {
        scheduleDealerTurnDelay();
        return;
      }
      // Shoot player with live shell
      aimAndShoot('player');
      return;
    }

    // ===== UNKNOWN SHELL LOGIC =====
    // Use Magnifying Glass when uncertainty is high and decision matters
    if (!knownShell && remaining > 0) {
      // Use glass if dealer is low and needs to know if safe to shoot self
      if (isDealerLow && pLive > 0.4 && pLive < 0.7 && useItem('MAGNIFYING_GLASS')) {
        scheduleDealerTurnDelay();
        return;
      }
      // Use glass in mid-uncertainty range for better decision making
      if (pLive > 0.35 && pLive < 0.65 && useItem('MAGNIFYING_GLASS')) {
        scheduleDealerTurnDelay();
        return;
      }
    }

    // ===== ITEM USAGE PRIORITIES =====
    // Hand Saw: Use when we can secure a kill or significant advantage
    if (!knownShell && pLive >= 0.65 && canKillPlayer && hasItem('HAND_SAW') && useItem('HAND_SAW')) {
      scheduleDealerTurnDelay();
      return;
    }

    // Beer: Eject dangerous live shells when dealer is low
    if (!knownShell && pLive > 0.65 && isDealerLow && useItem('BEER')) {
      scheduleDealerTurnDelay();
      return;
    }

    // Skip: Use when we want to force player to take a risky shot (high live odds)
    // This is better than shooting ourselves when odds are against us
    if (!knownShell && pLive >= 0.65 && hpAdvantage <= 0 && useItem('SKIP')) {
      scheduleDealerTurnDelay();
      return;
    }

    // Random Pill: Use when low HP and no better options (risky but can help)
    if (isDealerLow && hasItem('RANDOM_PILL') && !hasItem('CIGARETTES') && random() < 0.5 && useItem('RANDOM_PILL')) {
      scheduleDealerTurnDelay();
      return;
    }

    // Steal: Only if we have space and player has items (low priority)
    if (current.playerInventory.length > 0 && current.dealerInventory.length < MAX_INVENTORY && random() < 0.25 && useItem('STEAL')) {
      scheduleDealerTurnDelay();
      return;
    }

    // Shake Down: Disrupt player if they have multiple items
    if (current.playerInventory.length >= 2 && random() < 0.2 && useItem('SHAKE_DOWN')) {
      scheduleDealerTurnDelay();
      return;
    }

    // ===== SHOOTING DECISIONS =====
    // High live odds: shoot player (aggressive)
    if (pLive >= 0.7) {
      aimAndShoot('player');
      return;
    }

    // Low live odds: shoot self to earn skip (defensive)
    if (pLive <= 0.3) {
      aimAndShoot('dealer');
      return;
    }

    // Mid odds (0.3 < pLive < 0.7): Strategic decision
    // If we have HP advantage, be more aggressive
    if (hpAdvantage > 0) {
      aimAndShoot('player');
      return;
    }
    // If player has advantage or equal, be more defensive
    if (hpAdvantage <= 0) {
      // If dealer is low, shoot self to get skip
      if (isDealerLow) {
        aimAndShoot('dealer');
        return;
      }
      // Otherwise, slight bias toward player (60/40)
      if (random() < 0.6) {
        aimAndShoot('player');
      } else {
        aimAndShoot('dealer');
      }
      return;
    }
  };

  useEffect(() => {
    if (cryptoState.phase !== 'playing') return;
    if (gameState.matchOver) return;
    if (wheelState.active) return;
    if (gameState.currentTurn !== 'dealer') return;

    if (gameState.statusEffects.dealer.skipTurnsRemaining > 0) {
      setGameState(prev => {
        const updatedStatus = {
          player: { ...prev.statusEffects.player },
          dealer: { ...prev.statusEffects.dealer, skipTurnsRemaining: Math.max(0, prev.statusEffects.dealer.skipTurnsRemaining - 1) }
        };
        return {
          ...prev,
          statusEffects: updatedStatus,
          currentTurn: 'player',
          log: pushTelemetry(prev.log, `${ACTOR_LABEL.dealer} turn skipped`)
        };
      });
      return;
    }

    if (dealerTimerRef.current) {
      clearTimeout(dealerTimerRef.current);
    }
    dealerTimerRef.current = setTimeout(() => {
      dealerTimerRef.current = null;
      dealerTakeTurn();
    }, DEALER_TURN_DELAY_MS);
    return () => {
      if (dealerTimerRef.current) {
        clearTimeout(dealerTimerRef.current);
        dealerTimerRef.current = null;
      }
    };
  }, [
    gameState.currentTurn,
    gameState.statusEffects.dealer.skipTurnsRemaining,
    gameState.matchOver,
    gameState.chamber.length,
    gameState.currentShellIndex,
    cryptoState.phase
  ]);

  useEffect(() => {
    if (!wheelState.active) return;
    if (wheelState.spinning) return;
    if (wheelState.currentOwner === 'dealer' && !wheelState.lastItem) {
      console.log('[WHEEL EFFECT] Scheduling dealer spin in 800ms');
      const t = setTimeout(() => spinWheel('dealer'), 800);
      return () => clearTimeout(t);
    }
  }, [wheelState.active, wheelState.spinning, wheelState.currentOwner, wheelState.lastItem]);

  // Helper to determine gun transform class
  const getGunContainerClass = () => {
    if (aimingAt === 'dealer') return 'translate-y-[40px] scale-95'; 
    if (aimingAt === 'self') return 'translate-y-[10px] scale-110'; 
    return 'group-hover:scale-[1.02] group-hover:-rotate-1'; 
  };

  // --- UI COMPONENTS ---

  // Animated Loading Text Component (for Pyth loading)
  const AnimatedLoadingText = ({ status }) => {
    const [dots, setDots] = useState('.');
    
    useEffect(() => {
      if (!status || status === 'received') return;
      
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, 500); // Change every 500ms
      
      return () => clearInterval(interval);
    }, [status]);
    
    const baseText = status === 'requesting' ? 'Requesting' : 
                     status === 'waiting' ? 'Waiting for Pyth' : 
                     'Processing';
    
    return <span>{baseText}{dots}</span>;
  };

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
  // Render inventory bar inline to avoid component recreation issues
  const renderInventoryBar = (items, owner, max, onUse, isPlayer) => {
    return (
      <div 
        className="flex flex-col items-center gap-2"
        onMouseLeave={clearHoverWithDelay}
      >
        <div className="text-[0.5rem] sm:text-[0.6rem] md:text-[0.65rem] text-zinc-300 tracking-[0.25em] sm:tracking-[0.32em] uppercase font-bold text-shadow-glow">
          {owner} Items
        </div>
        <div className="flex gap-2 sm:gap-2 p-2 sm:p-2 bg-zinc-900/80 border border-zinc-700 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(20,0,0,0.5)]">
          {[...Array(max)].map((_, i) => {
            const item = items[i];
            // Check hover by comparing item id
            const isHovered = item && hoveredInventoryItem && hoveredInventoryItem.id === item.id;
            return (
              <div 
                key={i}
                onClick={() => {
                  if (isPlayer && item && onUse) {
                    // Immediately clear on use
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHoveredInventoryItem(null);
                    onUse(item);
                  }
                }}
                onMouseEnter={() => {
                  if (item) setHoverItem(item);
                }}
                onMouseLeave={clearHoverWithDelay}
                className={`w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 border flex items-center justify-center transition-all duration-200 relative overflow-hidden rounded-md
                  ${item 
                    ? `bg-zinc-800 shadow-inner ${isPlayer ? 'cursor-pointer' : 'cursor-default'} ${isHovered ? 'border-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-red-500/50 hover:border-red-400'}`
                    : 'bg-transparent border-zinc-800 text-zinc-700'
                  }`}
              >
                {item ? (
                  <div className={`transition-colors duration-200 ${isHovered ? 'text-red-400' : 'text-zinc-200'}`}>
                    {React.cloneElement(item.icon, { className: "w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" })}
                  </div>
                ) : (
                  <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const HealthBar = ({ health, max = 4, side = 'left' }) => (
    <div className={`flex items-center gap-1.5 sm:gap-1 md:gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {[...Array(max)].map((_, i) => (
        <div 
          key={i} 
          className={`w-6 h-7 sm:w-5 sm:h-6 md:w-6 md:h-8 lg:w-8 lg:h-10 border-2 transition-all duration-1000 ${
            i < health 
              ? 'bg-red-600 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse-slow' 
              : 'bg-zinc-900 border-zinc-800 opacity-50'
          } rounded-sm`}
        />
      ))}
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

      {/* Duct Tape Shield Effect */}
      {effectOverlay === 'shield' && (
        <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
            <div className="absolute inset-[20%] border-4 border-blue-400/50 rounded-full animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-32 h-32 text-blue-400/60 animate-bounce" />
            </div>
        </div>
      )}

      {/* Random Pill Heal Effect */}
      {effectOverlay === 'heal' && (
        <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-green-500/15 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-black text-green-400 animate-bounce drop-shadow-[0_0_20px_rgba(74,222,128,0.6)]">+2 HP</div>
            </div>
        </div>
      )}

      {/* Random Pill Damage Effect */}
      {effectOverlay === 'damage' && (
        <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-red-500/20 animate-flash-out" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-black text-red-400 animate-bounce drop-shadow-[0_0_20px_rgba(248,113,113,0.6)]">-1 HP</div>
            </div>
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
               onClick={() => {
                 if (!isWalletConnected) {
                   setShowWalletModal(true);
                 } else {
                   setCryptoState(p => ({...p, phase: 'betting'}));
                 }
               }} 
               icon={<Skull className="w-5 h-5"/>} 
               label="Play" 
               primary 
             />
             <MenuButton onClick={() => {}} icon={<Swords className="w-5 h-5"/>} label="PvP (Soon)" />
             <MenuButton onClick={() => setShowProfile(true)} icon={<User className="w-5 h-5"/>} label="Profile" />
             <MenuButton onClick={() => setShowHowToPlay(true)} icon={<HelpCircle className="w-5 h-5"/>} label="How to Play" />
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
                <div className="relative w-24 h-4 flex items-center">
                   <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden group-hover:bg-zinc-700 transition-colors">
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
                       setVolume(Number(e.target.value));
                       if (Number(e.target.value) > 0) setIsMuted(false);
                     }}
                     className="absolute inset-0 opacity-0 w-full cursor-pointer"
                   />
                </div>
             </div>

             {/* Social Links */}
             <div className="flex gap-6">
                <button 
                  onClick={() => window.open('https://discord.gg/B9W64gZjQG', '_blank', 'noopener,noreferrer')}
                  className="hover:text-[#5865F2] hover:scale-110 transition-all duration-200"
                  aria-label="Discord"
                >
                  <DiscordIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => window.open('https://x.com/KshitijGajapure', '_blank', 'noopener,noreferrer')}
                  className="hover:text-white hover:scale-110 transition-all duration-200"
                  aria-label="Twitter"
                >
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
                      <div className="text-xs text-zinc-500 uppercase tracking-widest">Initialize Contract</div>
                      {!contractRef.current && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
                          <p className="text-yellow-400 text-xs">Please connect your wallet to initialize the contract.</p>
                        </div>
                      )}
                      {contractRef.current && CONTRACT_CONFIG.address === '0x0000000000000000000000000000000000000000' && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
                          <p className="text-yellow-400 text-xs">Contract not configured. Please deploy contract and update CONTRACT_ADDRESS in contractConfig.js</p>
                        </div>
                      )}
                  </div>

                  <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded">
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-xs text-zinc-400 uppercase tracking-wider">Available Balance</span>
                          <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-zinc-500" /> 
                              {cryptoState.balance.toFixed(2)} MON
                          </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-red-900/10 border border-red-500/20 rounded">
                          <span className="text-xs text-red-400 uppercase tracking-wider font-bold">Entry Cost</span>
                          <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-mono text-red-500 font-black tracking-tighter">1.00</span>
                              <span className="text-xs text-red-400 font-bold">MON</span>
                          </div>
                      </div>
                      
                      <div className="text-center mt-4 text-[0.6rem] text-zinc-600 uppercase tracking-widest font-mono">
                          Standard Protocol Wager Locked
                      </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                        onClick={() => setCryptoState(p => ({...p, phase: 'main_menu'}))}
                        disabled={entropyStatus === 'requesting' || entropyStatus === 'waiting'}
                        className={`flex-1 py-4 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400 font-bold tracking-[0.2em] uppercase transition-all duration-300 text-xs ${
                          (entropyStatus === 'requesting' || entropyStatus === 'waiting') 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleStartGame}
                        disabled={isContractLoading || !contractRef.current || !CONTRACT_CONFIG.address || CONTRACT_CONFIG.address === '0x0000000000000000000000000000000000000000'}
                        className="flex-[2] py-4 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 font-black tracking-[0.2em] uppercase transition-all duration-300 group"
                    >
                        {isContractLoading ? (
                          <AnimatedLoadingText status={entropyStatus} />
                        ) : (
                          <>
                            <span className="group-hover:mr-2 transition-all">Sign Contract</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-all">_&gt;</span>
                          </>
                        )}
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
                          <span className="font-mono text-zinc-300">{cryptoState.currentWager.toFixed(2)} MON</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border-b border-zinc-800">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Multiplier</span>
                          <span className="font-mono text-green-400">{cryptoState.multiplier}x</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/20 rounded">
                          <span className="text-xs text-green-500 uppercase tracking-wider font-bold">Total Payout</span>
                          <span className="text-xl font-black text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
                              {(cryptoState.currentWager * cryptoState.multiplier).toFixed(2)} MON
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
          <div className={`fixed inset-0 z-[200] ${gameState.lastOutcome === 'player' ? 'bg-green-950/90' : 'bg-red-950/90'} backdrop-blur-md flex items-center justify-center p-4`}>
              <div className="text-center animate-in zoom-in duration-300">
                  {gameState.lastOutcome === 'player' ? (
                    <Trophy className="w-24 h-24 mx-auto mb-6 text-green-300 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
                  ) : (
                    <Skull className="w-24 h-24 mx-auto mb-6 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                  )}
                  <h1 className={`text-6xl font-black tracking-tighter mb-2 ${gameState.lastOutcome === 'player' ? 'text-green-100' : 'text-white'} text-shadow-aberration`}>
                    {gameState.lastOutcome === 'player' ? 'YOU WIN' : 'YOU DIED'}
                  </h1>
                  <div className={`${gameState.lastOutcome === 'player' ? 'text-green-300' : 'text-red-300'} font-mono tracking-widest text-sm mb-8`}>
                      {gameState.lastOutcome === 'player' ? 'Victory: +' : 'LOSS: -'}{gameState.lastOutcome === 'player' ? (cryptoState.currentWager * 2).toFixed(2) : (cryptoState.currentWager).toFixed(2)} MON
                  </div>
                  
                  {/* Buttons Container */}
                  <div className="flex items-center justify-center gap-4">
                    {/* RNG Verification Button - Always shown, disabled until data is fetched */}
                    <button
                      onClick={() => rngVerificationData && setShowRNGVerification(true)}
                      disabled={!rngVerificationData}
                      className={`group relative px-8 py-4 border transition-all duration-300 overflow-hidden ${
                        rngVerificationData 
                          ? 'bg-zinc-900 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800 cursor-pointer' 
                          : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute inset-0 transition-opacity duration-300 ${
                        rngVerificationData ? 'bg-red-500/0 group-hover:bg-red-500/5' : ''
                      }`} />
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <Search className={`w-5 h-5 transition-colors ${
                          rngVerificationData 
                            ? 'text-zinc-500 group-hover:text-red-400' 
                            : 'text-zinc-700'
                        }`} />
                        <span className={`font-black tracking-[0.2em] uppercase transition-colors ${
                          rngVerificationData 
                            ? 'text-zinc-400 group-hover:text-zinc-200' 
                            : 'text-zinc-600'
                        }`}>
                          {rngVerificationData ? 'Verify RNG' : 'Loading RNG...'}
                        </span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                          setCryptoState(prev => ({ ...prev, currentWager: 0, phase: 'main_menu', multiplier: 1.0 })); // Reset to main menu
                          setGameState(prev => ({
                            ...createInitialGameState(rngSeedRef.current),
                            log: ["Session reset.", "Ready."]
                          }));
                          rewardClaimedRef.current = false; // Reset reward claim flag
                          setRngVerificationData(null); // Clear RNG data
                          setShowRNGVerification(false);
                      }}
                      className="group relative px-8 py-4 border transition-all duration-300 overflow-hidden bg-zinc-900 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800"
                    >
                      <div className="absolute inset-0 transition-opacity duration-300 bg-red-500/0 group-hover:bg-red-500/5" />
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <span className="font-black tracking-[0.2em] uppercase transition-colors text-zinc-400 group-hover:text-zinc-200">
                          Re-Initialize
                        </span>
                      </div>
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* RNG Verification Modal */}
      {showRNGVerification && rngVerificationData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" />
                RNG Verification
              </h2>
              <button
                onClick={() => setShowRNGVerification(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Verification Status */}
              <div className={`p-4 rounded-lg border-2 ${
                rngVerificationData.verification.isValid && rngVerificationData.verification.baseSeedValid
                  ? 'bg-green-950/30 border-green-500/50'
                  : 'bg-yellow-950/30 border-yellow-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {rngVerificationData.verification.isValid && rngVerificationData.verification.baseSeedValid ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 font-bold">Verification Passed</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="text-yellow-400 font-bold">Partial Verification</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-zinc-300">
                  {rngVerificationData.verification.message}
                </p>
                {rngVerificationData.verification.baseSeedValid !== undefined && (
                  <p className="text-xs text-zinc-400 mt-2">
                    Base Seed Match: {rngVerificationData.verification.baseSeedValid ? '✅ Verified' : '❌ Mismatch'}
                  </p>
                )}
              </div>

              {/* RNG Components */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">RNG Components</h3>
                
                <div className="space-y-3">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Base Seed (from Pyth Entropy)</div>
                    <div className="font-mono text-sm text-zinc-300 break-all">
                      {rngVerificationData.formatted.baseSeed.full}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Short: {rngVerificationData.formatted.baseSeed.short}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">RNG Commitment</div>
                    <div className="font-mono text-sm text-zinc-300 break-all">
                      {rngVerificationData.formatted.rngCommitment.full}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Short: {rngVerificationData.formatted.rngCommitment.short}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Server Nonce (revealed after game)</div>
                    <div className="font-mono text-sm text-zinc-300 break-all">
                      {rngVerificationData.formatted.serverNonce.full}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Short: {rngVerificationData.formatted.serverNonce.short}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Game Start Time</div>
                    <div className="text-sm text-zinc-300">
                      {rngVerificationData.formatted.startTimestamp.readable}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {rngVerificationData.formatted.startTimestamp.relative}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Game ID</div>
                    <div className="font-mono text-sm text-zinc-300 break-all">
                      {rngVerificationData.formatted.gameId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Analysis */}
              {rngVerificationData.verification.analysis && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Component Analysis</h3>
                  <div className="bg-zinc-950 p-4 rounded border border-zinc-800 space-y-2">
                    {Object.entries(rngVerificationData.verification.analysis.components).map(([key, comp]) => (
                      <div key={key} className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs text-zinc-400">{comp.description}</div>
                          <div className="text-sm text-zinc-300 mt-1">
                            {key === 'timestamp' ? comp.readable : comp.value}
                          </div>
                        </div>
                        <div className={`ml-4 ${comp.isValid ? 'text-green-400' : 'text-red-400'}`}>
                          {comp.isValid ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500 italic">
                    {rngVerificationData.verification.analysis.note}
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-300">
                    <p className="font-bold mb-1">About RNG Verification:</p>
                    <p className="text-blue-400/80">
                      The RNG commitment is computed using: baseSeed + serverSecret + serverNonce + playerAddress + timestamp.
                      The server secret is not revealed for security, but you can verify that all other components are valid and consistent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Button - Bottom Right Corner (Gameplay Only) */}
      {cryptoState.phase === 'playing' && (
        <button
          onClick={() => setShowHowToPlay(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-red-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300 group"
          aria-label="How to Play"
        >
          <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-400 group-hover:text-red-400 transition-colors" />
        </button>
      )}

      {/* TOP HEADER */}
      <header className="p-2 sm:p-3 md:p-4 lg:p-6 bg-transparent relative z-50 border-b border-red-500/20 overflow-hidden min-w-0">
        {/* Desktop Layout: Original 3-column layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <div className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-red-900/10"></div>
              <div className="relative z-10 opacity-90">
                  <User className="text-zinc-400 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.5rem] md:text-[0.6rem] lg:text-[0.65rem] text-red-500 font-bold tracking-tighter mb-0.5 sm:mb-1 text-shadow-aberration truncate">UNIT_PLAYER_01</div>
              <div className="flex items-center gap-1 md:gap-2">
                <HealthBar health={gameState.playerHealth} />
                {gameState.tempEffects?.player?.shieldNextDamage > 0 && (
                  <div className="w-6 h-7 sm:w-5 sm:h-6 md:w-6 md:h-8 lg:w-8 lg:h-10 border-2 bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-slow rounded-sm" />
                )}
              </div>
            </div>
          </div>

          {/* --- ECONOMY HUD --- */}
          <div className="flex flex-col items-center px-2">
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-xs md:text-sm lg:text-base font-black tracking-[0.2em] md:tracking-[0.3em] lg:tracking-[0.35em] uppercase drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-2 md:gap-3">
                <span className="text-red-500 whitespace-nowrap">Round {gameState.round}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 whitespace-nowrap">Reward:</span>
                <span className="text-white whitespace-nowrap">2 MON</span>
              </div>
              <div className="text-[0.65rem] md:text-xs lg:text-sm text-zinc-300 font-bold flex items-center gap-1.5 md:gap-2">
                <span className="text-red-400 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] whitespace-nowrap">LIVE: {gameState.liveShells}</span>
                <span className="opacity-30">|</span>
                <span className="text-zinc-400 whitespace-nowrap">BLANK: {gameState.blankShells}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-row-reverse flex-1">
            <div className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="relative w-full h-full flex items-center justify-center">
                 <div className="w-1 h-1 bg-red-600 rounded-full absolute left-2 md:left-3 shadow-[0_0_8px_red]" />
                 <div className="w-1 h-1 bg-red-600 rounded-full absolute right-2 md:right-3 shadow-[0_0_8px_red]" />
              </div>
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-[0.5rem] md:text-[0.6rem] lg:text-[0.65rem] text-red-500 font-bold tracking-tighter mb-0.5 sm:mb-1 text-shadow-aberration truncate">THE_DEALER</div>
              <div className="flex items-center gap-1 md:gap-2 justify-end">
                {gameState.tempEffects?.dealer?.shieldNextDamage > 0 && (
                  <div className="w-6 h-7 sm:w-5 sm:h-6 md:w-6 md:h-8 lg:w-8 lg:h-10 border-2 bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-slow rounded-sm" />
                )}
                <HealthBar health={gameState.dealerHealth} side="right" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Health bars on top, HUD text below */}
        <div className="flex sm:hidden flex-col gap-2">
          {/* Health bars row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <div className="text-[0.5rem] text-red-500 font-bold tracking-tighter text-shadow-aberration">UNIT_PLAYER_01</div>
              <div className="flex items-center gap-2">
                <HealthBar health={gameState.playerHealth} />
                {gameState.tempEffects?.player?.shieldNextDamage > 0 && (
                  <div className="w-6 h-7 border-2 bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-slow rounded-sm" />
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[0.5rem] text-red-500 font-bold tracking-tighter text-shadow-aberration">THE_DEALER</div>
              <div className="flex items-center gap-2">
                {gameState.tempEffects?.dealer?.shieldNextDamage > 0 && (
                  <div className="w-6 h-7 border-2 bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-slow rounded-sm" />
                )}
                <HealthBar health={gameState.dealerHealth} side="right" />
              </div>
            </div>
          </div>
          
          {/* HUD text row */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-black tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-2">
              <span className="text-red-500 whitespace-nowrap">Round {gameState.round}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 whitespace-nowrap">Reward:</span>
              <span className="text-white whitespace-nowrap">2 MON</span>
            </div>
            <div className="text-sm text-zinc-300 font-bold flex items-center gap-2">
              <span className="text-red-400 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] whitespace-nowrap">LIVE: {gameState.liveShells}</span>
              <span className="opacity-30">|</span>
              <span className="text-zinc-400 whitespace-nowrap">BLANK: {gameState.blankShells}</span>
            </div>
          </div>
        </div>
      </header>

      {/* GAME TABLE AREA */}
      <main className={`flex-1 relative flex flex-col items-center justify-between pt-4 sm:pt-8 pb-4 sm:pb-8 px-4 sm:px-8 bg-transparent z-40 overflow-x-hidden ${shotEffect ? 'animate-shake' : ''}`}>
        
        {/* TOP SECTION: Dealer Eyes & Inventory */}
        <div className="flex flex-col items-center gap-2 w-full -mt-4 sm:-mt-8">
          <div className="relative group" ref={gameEyesRef}>
               <div className={`absolute -inset-12 sm:-inset-24 bg-red-900/5 blur-[60px] sm:blur-[90px] rounded-full pointer-events-none transition-all duration-300 ${shotEffect === 'dealer' ? 'bg-red-600/30 blur-[80px] sm:blur-[120px]' : ''} animate-pulse-slow`} />
               <div className="absolute -inset-10 sm:-inset-20 bg-white/10 blur-[70px] sm:blur-[110px] rounded-full pointer-events-none opacity-60" />
               
               <div
                 className={`w-40 h-24 sm:w-48 sm:h-32 flex items-center justify-center relative transition-transform duration-200 ${shotEffect === 'dealer' ? 'scale-125' : ''} ${
                   aimingAt === 'dealer'
                     ? 'scale-125 saturate-150 animate-[fear-wiggle_0.6s_ease-in-out_infinite]'
                     : aimingAt === 'self'
                       ? 'scale-110 contrast-125 blur-[0.5px]'
                       : ''
                 }`}
               >
                 <div
                   className="absolute left-[25%] sm:left-[30%] -translate-x-1/2 flex flex-col items-center"
                   style={{ transform: `translate(${calcDealerEyeOffset(-30).x}px, ${calcDealerEyeOffset(-30).y}px)` }}
                 >
                   <div
                     className={`rounded-full transition-all duration-200 animate-blink ${
                       shotEffect === 'dealer'
                         ? 'bg-red-600 shadow-[0_0_30px_red] w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8'
                         : 'bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.6)] w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5'
                     } ${
                       aimingAt === 'dealer'
                         ? 'w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-red-500 shadow-[0_0_35px_rgba(220,38,38,0.8)]'
                         : aimingAt === 'self'
                           ? 'w-5 h-5 sm:w-5 sm:h-5 md:w-7 md:h-7 bg-red-500 shadow-[0_0_35px_rgba(220,38,38,0.7)]'
                           : ''
                     }`}
                     style={{
                       animationDuration: aimingAt ? '3s' : '6s',
                       animationDelay: '0.2s',
                       ...(aimingAt === 'self'
                         ? {
                             background: 'radial-gradient(circle at center, #0b0b0b 0 18%, rgba(248,113,113,0.95) 35%, #ef4444 60%, #b91c1c 100%)',
                             boxShadow: '0 0 45px rgba(220,38,38,0.9), 0 0 70px rgba(220,38,38,0.6)',
                           }
                         : {}),
                     }}
                   />
                 </div>

                 <div
                   className="absolute right-[25%] sm:right-[30%] translate-x-1/2 flex flex-col items-center"
                   style={{ transform: `translate(${calcDealerEyeOffset(30).x}px, ${calcDealerEyeOffset(30).y}px)` }}
                 >
                   <div
                     className={`rounded-full transition-all duration-200 animate-blink ${
                       shotEffect === 'dealer'
                         ? 'bg-red-600 shadow-[0_0_30px_red] w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8'
                         : 'bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.6)] w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5'
                     } ${
                       aimingAt === 'dealer'
                         ? 'w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-red-500 shadow-[0_0_35px_rgba(220,38,38,0.8)]'
                         : aimingAt === 'self'
                           ? 'w-5 h-5 sm:w-5 sm:h-5 md:w-7 md:h-7 bg-red-500 shadow-[0_0_35px_rgba(220,38,38,0.7)]'
                           : ''
                     }`}
                     style={{
                       animationDuration: aimingAt ? '3s' : '5.5s',
                       animationDelay: '0s',
                       ...(aimingAt === 'self'
                         ? {
                             background: 'radial-gradient(circle at center, #0b0b0b 0 18%, rgba(248,113,113,0.95) 35%, #ef4444 60%, #b91c1c 100%)',
                             boxShadow: '0 0 45px rgba(220,38,38,0.9), 0 0 70px rgba(220,38,38,0.6)',
                           }
                         : {}),
                     }}
                   />
                 </div>

                 <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none animate-noise" />
               </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-4 duration-1000 mt-2 sm:mt-6 relative z-10 opacity-90 flex flex-col items-center">
            {/* Dealer's Turn/Skip Indicator - fixed height to prevent layout shift */}
            <div className="h-6 sm:h-8 flex items-center justify-center gap-1 sm:gap-2 mb-1">
              {turnLabel && gameState.currentTurn === 'dealer' && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-0.5 sm:py-1 bg-zinc-900/80 border border-red-500/50 text-[0.5rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full shadow-[0_0_12px_rgba(248,113,113,0.3)]">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)] animate-pulse" />
                  <span className="text-red-300">Dealer Turn</span>
                </div>
              )}
              {pendingDealerSkips > 0 && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-900/30 border border-yellow-500/50 text-[0.5rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                  <span className="text-yellow-300">Dealer Skip: {pendingDealerSkips}</span>
                </div>
              )}
            </div>
            
            {renderInventoryBar(gameState.dealerInventory, "Dealer", 4, null, false)}
          </div>
        </div>

        {/* MIDDLE SECTION: THE SHOTGUN */}
        <div className="flex-1 flex items-center justify-center w-full max-w-3xl relative py-2 sm:py-4 z-20 -mt-10 sm:-mt-20">
      {wheelState.active && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto font-mono pt-24 sm:pt-0">
            <div className="text-center mb-4 sm:mb-8 mt-12 sm:mt-0 animate-in slide-in-from-top-4 px-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-2 text-shadow-aberration">
              {wheelState.currentOwner === 'player' ? "PLAYER DISTRIBUTION" : "DEALER DISTRIBUTION"}
            </h2>
            <p className="text-zinc-500 text-[0.6rem] sm:text-xs font-mono uppercase tracking-widest">
              {wheelState.currentOwner === 'player' ? "Initiate Spin Sequence" : "Automated Dispenser Active"}
            </p>
            <div className="mt-2 mb-2 sm:mb-0 text-red-500 font-bold text-[0.6rem] sm:text-xs uppercase tracking-widest animate-pulse">
              {remainingSpins} Spins Remaining
            </div>
          </div>

          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mb-4 sm:mb-12">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 60L5 20H35L20 60Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
                    <rect x="10" y="0" width="20" height="25" fill="#18181b" stroke="#27272a" strokeWidth="2" />
                    <circle cx="20" cy="12" r="4" fill="#52525b" />
                </svg>
            </div>
            <div
              className="w-full h-full rounded-full border-[8px] border-zinc-800 bg-zinc-950 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] transition-transform"
              style={{
                transform: `rotate(${wheelState.rotation}deg)`,
                transitionDuration: wheelState.spinning ? '4s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.35, 1)'
              }}
            >
              {/* Divider lines first */}
              {wheelState.pool.map((kind, idx) => {
                const segmentAngle = 360 / (wheelState.pool.length || 1);
                const angle = segmentAngle * idx;
                return (
                  <div 
                    key={`divider-${kind}`}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-zinc-800 origin-bottom"
                    style={{ transform: `rotate(${angle}deg)`, zIndex: 1 }}
                  />
                );
              })}
              {/* Icon buttons - rendered separately to avoid overlap issues */}
              {wheelState.pool.map((kind, idx) => {
                const segmentAngle = 360 / (wheelState.pool.length || 1);
                const contentRotation = (segmentAngle * idx) + (segmentAngle / 2);
                const iconConfig = ITEM_CONFIG[kind];
                if (!iconConfig) return null;
                const isHovered = hoveredWheelItem === kind;
                // Calculate position on the wheel edge (responsive radius)
                const radius = window.innerWidth < 640 ? 90 : window.innerWidth < 768 ? 110 : 140;
                const radians = (contentRotation - 90) * (Math.PI / 180);
                const x = Math.cos(radians) * radius;
                const y = Math.sin(radians) * radius;
                return (
                  <div 
                    key={`icon-${kind}`}
                    className="absolute"
                    style={{ 
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      zIndex: isHovered ? 100 : 10
                    }}
                  >
                    <div 
                      className={`p-2 sm:p-2.5 md:p-3 bg-zinc-900/80 rounded-full border shadow-inner backdrop-blur-sm transition-all duration-200 cursor-pointer ${isHovered ? 'border-red-500 scale-125 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-zinc-800 hover:border-zinc-600'}`}
                      onMouseEnter={() => setHoveredWheelItem(kind)}
                      onMouseLeave={() => setHoveredWheelItem(null)}
                    >
                      <div className={`transition-colors duration-200 ${isHovered ? 'text-red-400' : 'text-zinc-400'}`}>
                        {React.cloneElement(iconConfig.icon, { className: "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="absolute inset-[30%] rounded-full border border-zinc-800/50 pointer-events-none" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-zinc-900 border-2 sm:border-4 border-zinc-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] z-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border border-zinc-700 bg-[conic-gradient(var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-800 flex items-center justify-center">
                    <Disc className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-900/50 ${wheelState.spinning ? 'animate-spin' : ''} duration-1000`} />
                </div>
            </div>
          </div>

          {/* Item Tooltip on Hover */}
          <div className="h-12 flex items-center justify-center mb-4">
            {hoveredWheelItem && ITEM_CONFIG[hoveredWheelItem] && (
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="text-red-400">
                  {React.cloneElement(ITEM_CONFIG[hoveredWheelItem].icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{ITEM_CONFIG[hoveredWheelItem].label}</div>
                  <div className="text-xs text-zinc-400">{ITEM_CONFIG[hoveredWheelItem].description}</div>
                </div>
              </div>
            )}
          </div>

          <div className="h-24 flex items-center justify-center">
            {wheelState.lastItem ? (
                <div className="flex items-center gap-6 animate-in zoom-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-zinc-900 border border-red-500 rounded-lg text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        {React.cloneElement(ITEM_CONFIG[wheelState.lastItem]?.icon || <Disc />, { className: "w-8 h-8" })}
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Acquired Asset</div>
                        <div className="text-2xl font-black text-white uppercase tracking-tighter text-shadow-aberration">{ITEM_CONFIG[wheelState.lastItem]?.label || 'Item'}</div>
                    </div>
                </div>
            ) : (
                wheelState.currentOwner === 'player' && !wheelState.spinning && (
                    <button 
                        onClick={() => spinWheel('player')}
                        className="group relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:border-red-500 hover:text-red-400 transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                        SPIN
                    </button>
                )
            )}
            
            {wheelState.currentOwner === 'dealer' && !wheelState.lastItem && (
                <div className="text-red-900 font-black text-sm tracking-[0.5em] animate-pulse">
                    DEALER TURN...
                </div>
            )}
          </div>
        </div>
      )}
          <div className="relative w-full h-24 sm:h-32 md:h-40 flex items-center justify-center group cursor-crosshair">
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
        <div className="flex flex-col items-center gap-2 sm:gap-4 w-full mb-0">
          {/* Mobile Telemetry - Single Line */}
          <div className="sm:hidden w-full px-4 mb-2">
            <div className="text-[0.65rem] text-red-400 font-bold text-center truncate animate-pulse-slow">
              {gameState.log.length > 0 ? (gameState.log[gameState.log.length - 1] ?? '').toString().toUpperCase() : ''}
            </div>
          </div>
          
          <div className="flex gap-4 sm:gap-6 md:gap-8 relative z-10">
            <button 
              onClick={handleShootSelf}
              onMouseEnter={() => isPlayerTurn && !suppressHoverAim && setAimingAt('self')}
              onMouseLeave={() => isPlayerTurn && !suppressHoverAim && setAimingAt(null)}
              disabled={!isPlayerTurn}
              className="group relative px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm sm:text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Point at Self
            </button>
            <button 
              onClick={handleShootDealer}
              onMouseEnter={() => isPlayerTurn && !suppressHoverAim && setAimingAt('dealer')}
              onMouseLeave={() => isPlayerTurn && !suppressHoverAim && setAimingAt(null)}
              disabled={!isPlayerTurn}
              className="group relative px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm sm:text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Point at Him
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center">
            {/* Item Tooltip - same style as wheel */}
            <div className="h-10 flex items-center justify-center mb-2">
              {hoveredInventoryItem && (
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-red-400">
                    {React.cloneElement(hoveredInventoryItem.icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{hoveredInventoryItem.type}</div>
                    <div className="text-xs text-zinc-400">{hoveredInventoryItem.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Player's Turn/Skip Indicator - fixed height to prevent layout shift */}
            <div className="h-6 sm:h-8 flex items-center justify-center gap-1 sm:gap-2 mb-1">
              {turnLabel && gameState.currentTurn === 'player' && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-0.5 sm:py-1 bg-zinc-900/80 border border-green-500/50 text-[0.5rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full shadow-[0_0_12px_rgba(74,222,128,0.3)]">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
                  <span className="text-green-300">Your Turn</span>
                </div>
              )}
              {pendingPlayerSkips > 0 && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-900/30 border border-yellow-500/50 text-[0.5rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                  <span className="text-yellow-300">You Skip: {pendingPlayerSkips}</span>
                </div>
              )}
            </div>
            
            {renderInventoryBar(gameState.playerInventory, "Player", 4, isPlayerTurn ? handleUseItem : null, true)}
          </div>
        </div>

        {/* Side Logs */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-56 border-l border-zinc-800/50 pl-4 hidden lg:flex opacity-80 hover:opacity-100 transition-opacity max-h-64 overflow-y-auto flex-col justify-end space-y-3">
           <div className="text-[0.65rem] text-zinc-500 tracking-widest font-black uppercase border-b border-zinc-800/50 pb-1 text-shadow-sm">Telemetry</div>
           {gameState.log.map((log, i) => {
             const isLatest = i === gameState.log.length - 1;
             return (
               <div key={i} className={`text-[0.75rem] ${isLatest ? 'text-red-400 font-bold animate-pulse-slow' : 'text-zinc-300'} leading-tight tracking-tight`}>
                 {(log ?? '').toString().toUpperCase()}
               </div>
             );
           })}
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
        @keyframes fear-wiggle {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(1px, -1px) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
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

      {/* WALLET CONNECTION MODAL */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-md w-full mx-4 bg-zinc-900 border border-red-500/50 rounded-lg shadow-[0_0_60px_rgba(220,38,38,0.5)]">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-black tracking-[0.15em] uppercase text-white">Connect Wallet</h2>
              </div>
              {isWalletConnected && (
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              <div className="text-center">
                <p className="text-zinc-300 text-sm mb-4">
                  Connect your wallet to play Shotgun Roulette on Monad Testnet
                </p>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg mb-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Network</div>
                  <div className="text-lg font-bold text-red-500">Monad Testnet</div>
                  <div className="text-xs text-zinc-600 mt-1">Chain ID: {MONAD_CHAIN_ID}</div>
                </div>
              </div>

              {connectionError && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{connectionError}</p>
                </div>
              )}

              {!isWalletConnected && (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-sm transition-all rounded flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </>
                  )}
                </button>
              )}

              {isWalletConnected && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                    <div className="text-xs text-green-500 uppercase tracking-wider mb-2">Connected</div>
                    <div className="font-mono text-sm text-green-400 break-all">
                      {cryptoState.walletAddress}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-sm transition-all rounded"
                  >
                    Continue
                  </button>
                </div>
              )}

              {typeof window.ethereum === 'undefined' && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-400 text-sm mb-2">No Web3 wallet detected</p>
                  <p className="text-yellow-300 text-xs">
                    Please install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">MetaMask</a> or another Web3 wallet to continue.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-md w-full mx-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-[0_0_60px_rgba(220,38,38,0.3)]">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-black tracking-[0.15em] uppercase text-white">Profile</h2>
              </div>
              <button 
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Wallet Address */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Wallet Address</label>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div className="font-mono text-sm text-zinc-300 break-all">
                    {cryptoState.walletAddress}
                  </div>
                </div>
              </div>

              {/* MON Balance */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">MON Balance</label>
                <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-mono font-black text-red-500">
                      {cryptoState.balance.toFixed(2)} MON
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-6 py-4">
              <button 
                onClick={() => setShowProfile(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm transition-all rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-[0_0_60px_rgba(220,38,38,0.3)]">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-black tracking-[0.15em] uppercase text-white">How to Play</h2>
              </div>
              <button 
                onClick={() => setShowHowToPlay(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-6 text-zinc-300 text-sm leading-relaxed">
              
              {/* Overview */}
              <section>
                <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <Skull className="w-4 h-4" /> Overview
                </h3>
                <p>
                  Shotgun Roulette is a deadly game of chance and strategy. You face off against the Dealer in a 
                  turn-based duel using a shotgun loaded with a mix of <span className="text-red-400 font-bold">LIVE</span> and <span className="text-zinc-400 font-bold">BLANK</span> rounds.
                </p>
              </section>

              {/* Basic Rules */}
              <section>
                <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Basic Rules
                </h3>
                <ul className="space-y-2 list-none">
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span>Each round, the shotgun is loaded with 2-8 shells (at least 1 live, 1 blank)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span>On your turn, choose to shoot <strong>yourself</strong> or the <strong>Dealer</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span><span className="text-red-400 font-bold">LIVE</span> rounds deal 1 damage (2 with Hand Saw)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span><span className="text-zinc-400 font-bold">BLANK</span> rounds deal no damage</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span>Shooting yourself with a <span className="text-zinc-400 font-bold">BLANK</span> grants you another turn and skips the opponent's next turn!</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 flex-shrink-0">▸</span>
                    <span>First to reduce the opponent's HP to 0 wins</span>
                  </li>
                </ul>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Items
                </h3>
                <p className="mb-3 text-zinc-400">
                  After each round, both players receive items via the Roulette Wheel. Use them wisely!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(ITEM_CONFIG).map(([key, item]) => (
                    <div key={key} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
                      <div className="text-red-400 flex-shrink-0">
                        {React.cloneElement(item.icon, { className: "w-4 h-4" })}
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">{item.label}</div>
                        <div className="text-zinc-500 text-[0.65rem]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips */}
              <section>
                <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Pro Tips
                </h3>
                <ul className="space-y-2 list-none">
                  <li className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">★</span>
                    <span>Use the Magnifying Glass to know the current shell before deciding</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">★</span>
                    <span>If you know it's a BLANK, shoot yourself to skip the Dealer's turn</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">★</span>
                    <span>Combine Hand Saw + known LIVE for devastating 2-damage shots</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">★</span>
                    <span>Use Beer to eject unfavorable shells</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">★</span>
                    <span>Save the Shield for when you're low on HP</span>
                  </li>
                </ul>
              </section>

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
              <button 
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm transition-all rounded"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
