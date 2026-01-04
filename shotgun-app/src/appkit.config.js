import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'

// Monad Testnet configuration
// Using Viem's defineChain format for proper network configuration
import { defineChain } from 'viem'

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://testnet.monadvision.com',
    },
  },
  testnet: true,
})

// Get project ID from environment or use the provided project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'cbb9358b6e6523e21bd2dcdc55cb7055'

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [monadTestnet, mainnet],
  projectId,
  metadata: {
    name: 'Shotgun Roulette',
    description: 'Play Shotgun Roulette on Monad Testnet',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
    icons: []
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#dc2626', // Red accent to match your theme
  }
})

