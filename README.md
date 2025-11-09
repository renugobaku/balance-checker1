# BEP20 dApp - Balance Checker & Donation App

A single-page decentralized application (dApp) built with React, Vite, Ethers.js, and Web3Modal. Connect your wallet to check BEP20 token balances on BNB Smart Chain and make donations.

## Features

- 🔗 **Wallet Connection**: Connect using Web3Modal (supports mobile wallets)
- 💰 **Balance Checking**: Check native BNB and BEP20 token balances (USDT, USDC, etc.)
- ❤️ **Donations**: Make donations in BNB or USDT
- 🎨 **Modern UI**: Dark mode interface built with Tailwind CSS

## Tech Stack

- **Framework**: React + Vite
- **Wallet Connection**: Web3Modal (WalletConnect)
- **Web3 Library**: Ethers.js v6
- **Styling**: Tailwind CSS
- **Network**: BNB Smart Chain (BEP20)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Web3Modal

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID
4. Open `src/config.js` and replace `YOUR_PROJECT_ID_HERE` with your actual Project ID

```javascript
const projectId = 'YOUR_ACTUAL_PROJECT_ID'
```

### 3. Configure Donation Address

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder with your actual donation address:
   ```
   VITE_DONATION_ADDRESS=0xYourActualDonationAddressHere
   ```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the header
2. **Check Balances**: Click "Check My Token Balances" to see your BNB and token balances
3. **Make Donations**: Use the donation buttons to send BNB or USDT to the configured address

## Project Structure

```
balance-checker/
├── src/
│   ├── App.jsx          # Main application component
│   ├── config.js        # Web3Modal configuration
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind CSS imports
├── .env.local          # Environment variables (create this)
├── .env.example        # Example environment file
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Token Configuration

You can add more tokens to check by editing the `tokens` array in `src/App.jsx`:

```javascript
const tokens = [
  {
    name: 'Tether USD (USDT)',
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18
  },
  // Add more tokens here
];
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Important Notes

- Make sure your wallet is connected to BNB Smart Chain (Chain ID: 56)
- The donation amounts are fixed: 0.1 BNB and 10 USDT
- You need sufficient balance and gas (BNB) to make transactions
- Always verify the donation address before making a donation

## License

MIT
