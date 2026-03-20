# AiCapX

aicapX is a blockchain-based platform that allows users to invest in real-world assets through fractional ownership.

In traditional systems, investing in assets like real estate, infrastructure, or large projects requires high capital and access. Many people cannot participate because of these limitations.

aicapX solves this problem by tokenizing assets.  
This means an asset is converted into digital tokens on the blockchain, and each token represents a small share of ownership.

---

# 🌐 Live Demo

- **Live App**: https://aicapx.vercel.app/

---

# 📌 What This Project Does

## 🧠 AI Startups
- Apply through a form on the platform  
- Get approved by admin  
- Shares minted as NFTs on blockchain  

## 🛡️ Admin
- Review startup applications  
- Approve or reject projects  
- On approval → triggers NFT minting via `AiRegistration` smart contract  

## 💰 Investors
- Connect MetaMask wallet  
- Browse AI startup marketplace  
- Buy share tokens (ERC-721 NFTs)  
- Become co-owners of projects  

## 📊 Portfolio
- View owned shares  
- Track investments  
- Transfer tokens to other wallets  

## ⚙️ Backend
- Built with Express  
- Stores startup data in memory  
- Provides REST API to frontend  

---

# 🚀 How to Run Locally

## Step 1 — Clone and Install

```bash
git clone https://github.com/your-username/ai-defi-funding-platform.git
cd ai-defi-funding-platform

npm install
npm run install:all
```

---

## Step 2 — Set Up Environment Variables

### Root `.env`

```
PRIVATE_KEY=your_wallet_private_key_without_0x
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=optional_for_contract_verification
```

### Frontend `.env.local`

```bash
cd frontend
```

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTRACT_ADDRESS=paste_your_deployed_contract_address_here
```

---

## Step 3 — Deploy Smart Contract

> Get free tBNB for gas: https://testnet.binance.org/faucet-smart

```bash
npx hardhat run scripts/deployAiRegistration.js --network bscTestnet
```

Copy the deployed contract address into `.env.local`.

---

## Step 4 — Start Backend

```bash
cd backend
npm run dev
```

- Runs on: http://localhost:8000

---

## Step 5 — Start Frontend

```bash
cd frontend
npm run dev
```

- Runs on: http://localhost:3000

---

# 📄 Pages

- `/` → Landing page  
- `/market` → Browse and invest in AI startups  
- `/apply` → Submit your AI startup  
- `/startups` → View all startups  
- `/portfolio` → View and transfer shares  
- `/admin` → Approve/reject applications  

---

# 🛠️ Tech Stack

## Blockchain
- Solidity  
- Hardhat  
- OpenZeppelin ERC-721  
- BSC Testnet  

## Frontend
- Next.js  
- wagmi  
- RainbowKit  
- Framer Motion  

## Backend
- Node.js  
- Express (in-memory data store)  

## Deployment
- Vercel (Frontend)  
- Render (Backend)  

---

# ⚠️ Notes

- Runs on BSC Testnet (no real money involved)  
- Backend uses in-memory storage (resets on restart)  
- Use MetaMask with Chain ID: 97  
