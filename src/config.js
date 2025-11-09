import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'

// 1. Get projectId from WalletConnect Cloud
const projectId = 'c1ba86e6400a6920a64faddedecdb7f1' // Replace with your actual project ID

// 2. Define chains
const bscMainnet = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
}

// 3. Create modal
const metadata = {
  name: 'Balance Checker',
  description: 'A simple dApp for token balances and donations.',
  url: 'https://mywebsite.com', // origin domain
  icons: ['https://avatars.mywebsite.com/'] // logo
}

export const modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [bscMainnet],
  projectId,
  enableAnalytics: true, // Optional
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#F0B90B',
    '--w3m-border-radius-master': '8px',
  }
})

