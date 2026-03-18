---
description: Complete development, deployment, and operational workflow for AicapX AI DeFi Funding Platform
---

# AicapX Platform — Full Development & Deployment Workflow

## Overview

AicapX is a **3-tier AI DeFi Funding Platform** built on BSC Testnet with the following layers:

| Layer | Technology | Purpose |
|---|---|---|
| **Smart Contract** | Solidity + Hardhat | `AiRegistration.sol` — ERC-721 F-NFT minting & investment |
| **Backend API** | Node.js + Express | In-memory project registry, admin approval pipeline |
| **Frontend** | Next.js + wagmi/RainbowKit | Investor UI, Admin dashboard, Startup submission |

---

## PHASE 1 — Initial Setup

### 1. Clone & Install all dependencies

```powershell
cd e:\AicapX\ai-defi-funding-platform
npm run install:all
```

This installs both `backend` and `frontend` node_modules in one command.

### 2. Install root-level Hardhat dependencies

```powershell
cd e:\AicapX\ai-defi-funding-platform
npm install
```

### 3. Configure Environment Variables

**Root `.env`** (for Hardhat/contract deployment):
```
PRIVATE_KEY=<your_64_char_hex_private_key_without_0x>
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=<your_bscscan_api_key>
```

**Frontend `frontend/.env.local`** (for API connection):
```
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production (Render backend):
NEXT_PUBLIC_API_URL=https://aicapx-backend-ejp1.onrender.com
```

---

## PHASE 2 — Smart Contract Workflow

### Step 1: Compile the contract

```powershell
cd e:\AicapX\ai-defi-funding-platform
npx hardhat compile
```

Output is written to `artifacts/` and `cache/` directories.

### Step 2: Deploy to BSC Testnet

Ensure your wallet has **tBNB** from the [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart).

```powershell
npx hardhat run scripts/deployAiRegistration.js --network bscTestnet
```

After deployment:
- The contract address is printed to console and saved to `address_log.txt`
- A BscScan explorer link is displayed
- **You must manually copy the deployed address** into `frontend/src/pages/admin.jsx` → `CONTRACT_ADDRESS` constant

### Step 3: (Optional) Verify contract on BscScan

```powershell
npx hardhat verify --network bscTestnet <DEPLOYED_CONTRACT_ADDRESS>
```

### Contract Functions Summary

| Function | Access | Purpose |
|---|---|---|
| `invest(projectId, shares)` | Public + payable | Investor mints NFT shares, ETH goes to owner |
| `mint(owners[], amounts[], name, desc)` | Public (unrestricted) | Admin batch-mints tokens for startup approval |
| `multiTransfer(to, tokenIds[])` | Token owner | Transfer multiple NFTs in one tx |

---

## PHASE 3 — Backend API Workflow

### Start the backend server locally

```powershell
cd e:\AicapX\ai-defi-funding-platform\backend
node src/server.js
```

Server starts at: **`http://localhost:8000`**

### Backend API Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/health` | Any | Server health check |
| `GET` | `/api/applications` | Any | List all projects (filter by `?status=Active`) |
| `GET` | `/api/applications/:id` | Any | Get single project detail |
| `POST` | `/api/applications` | Startup | Submit new funding application |
| `PUT` | `/api/applications/:id/status` | Admin | Approve / Reject / Activate a project |
| `PUT` | `/api/applications/:id/raise` | System | Update raised amount after on-chain invest tx |
| `GET` | `/api/stats` | Admin | Platform stats (active, pending, total raised) |

### Application Status Lifecycle

```
Startup Submits
      │
      ▼
  "Under Review"   ← POST /api/applications
      │
      ├──[Admin Rejects]──► "Rejected"
      │
      └──[Admin Approves + Mints NFTs on-chain]──► "Active"
                                                      │
                                                      ▼
                                               Visible in Market
```

---

## PHASE 4 — Frontend Workflow

### Start the frontend dev server

```powershell
cd e:\AicapX\ai-defi-funding-platform\frontend
npm run dev
```

Frontend available at: **`http://localhost:3000`**

### Pages & Their Purpose

| Route | File | Who Uses It | Description |
|---|---|---|---|
| `/` | `index.jsx` | Everyone | Landing page — hero, stats, feature modules |
| `/market` | `market.jsx` | Investors | Browse & invest in active AI compute projects |
| `/portfolio` | `portfolio.jsx` | Investors | View NFT holdings, transfer tokens, track yield |
| `/startups` | `startups.jsx` | Founders | Info page about applying for funding |
| `/apply` | `apply.jsx` | Founders | Multi-step startup funding application form |
| `/admin` | `admin.jsx` | Admin only | Review applications, approve/reject, mint NFTs |

### Frontend Tech Stack

- **Next.js** — Framework + routing + SSR
- **wagmi + viem** — Wallet & blockchain interactions
- **RainbowKit** — Wallet connect UI (MetaMask, WalletConnect, etc.)
- **Framer Motion** — Animations & transitions
- **Lucide React** — Icon library

---

## PHASE 5 — Full End-to-End User Flows

### Flow A: Investor buys into a project

```
1. Investor opens /market
2. Connects MetaMask wallet (BSC Testnet, Chain ID: 97)
3. Browses Active projects fetched from backend API
4. Clicks "Invest" on a project card
5. Inputs number of shares (NFT tokens) to purchase
6. Approves the on-chain transaction via MetaMask
7. Smart contract: invest() mints NFT shares to investor's wallet
8. Backend: /api/applications/:id/raise is updated
9. Investor sees holdings in /portfolio
```

### Flow B: Startup applies for funding

```
1. Startup visits /apply
2. Fills multi-step form:
   - Project details (name, category, description)
   - Funding goal, token supply, APY projection
   - Founder info (name, email, LinkedIn)
   - Company info (registration, country, website)
   - Documents, demo video, GitHub link
   - Revenue model & yield strategy
   - Contact & social links
   - Wallet address to receive funds
3. Form submits to POST /api/applications
4. Status is set to "Under Review"
5. Admin reviews at /admin
```

### Flow C: Admin approves & mints project tokens

```
1. Admin visits /admin
2. Reviews "Under Review" applications
3. Can Approve or Reject each application
4. On Approve:
   a. Backend calls smart contract mint() function
   b. NFT tokens are minted to startup wallet
   c. Application status → "Active"
   d. contractAddress, explorerLink, mintTxHash stored in backend
5. Approved projects appear in /market for investors
```

### Flow D: Investor transfers tokens from portfolio

```
1. Investor visits /portfolio
2. Connects wallet
3. Selects token(s) from their holdings
4. Enters recipient wallet address
5. Selects percentage of tokens to transfer
6. Smart contract: multiTransfer() is called
7. Tokens are transferred in a single transaction
```

---

## PHASE 6 — Production Deployment

### Backend — Deploy to Render

1. Push backend code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend/`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Set environment variable: `PORT=8000`

> **Note:** The in-memory data resets on every deploy/restart. For persistence, integrate MongoDB or PostgreSQL.

### Frontend — Deploy to Vercel

```powershell
cd e:\AicapX\ai-defi-funding-platform\frontend
npx vercel --prod
```

Or connect GitHub repo to [vercel.com](https://vercel.com) for auto-deploys.

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://aicapx-backend-ejp1.onrender.com
```

CORS is already configured in `backend/src/server.js` to allow `https://aicapx-frontend.vercel.app`.

---

## PHASE 7 — Wallet & Network Configuration

### Required: BSC Testnet in MetaMask

Users must add BSC Testnet to MetaMask:

| Setting | Value |
|---|---|
| Network Name | BSC Testnet |
| RPC URL | `https://data-seed-prebsc-1-s1.binance.org:8545` |
| Chain ID | `97` |
| Symbol | `BNB` |
| Block Explorer | `https://testnet.bscscan.com` |

### Get Test BNB

Visit: [https://testnet.binance.org/faucet-smart](https://testnet.binance.org/faucet-smart)

---

## PHASE 8 — Common Dev Commands Reference

```powershell
# === Root (Hardhat) ===
npx hardhat compile                                        # Compile contracts
npx hardhat run scripts/deployAiRegistration.js --network bscTestnet  # Deploy
npx hardhat verify --network bscTestnet <ADDRESS>         # Verify on BscScan
npx hardhat node                                           # Local blockchain

# === Backend ===
cd backend && node src/server.js                           # Start API server
cd backend && npm install                                  # Install dependencies

# === Frontend ===
cd frontend && npm run dev                                 # Start dev server (port 3000)
cd frontend && npm run build                               # Production build
cd frontend && npm run lint                                # Lint check
cd frontend && npm install                                 # Install dependencies

# === Install Everything ===
npm run install:all                                        # Install backend + frontend
```

---

## PHASE 9 — Key Files Quick Reference

| File | Purpose |
|---|---|
| `contracts/AiRegistration.sol` | ERC-721 smart contract (invest, mint, multiTransfer) |
| `scripts/deployAiRegistration.js` | Hardhat deploy script |
| `hardhat.config.js` | Network config (BSC Testnet, Solidity 0.8.22) |
| `.env` | Root env (PRIVATE_KEY, BSC_TESTNET_RPC, BSCSCAN_API_KEY) |
| `address_log.txt` | Last deployed contract address |
| `backend/src/server.js` | Express API server with all routes |
| `backend/.env` | Backend env (PORT) |
| `frontend/src/pages/admin.jsx` | Admin dashboard — update `CONTRACT_ADDRESS` after deploy |
| `frontend/src/pages/market.jsx` | Investor marketplace |
| `frontend/src/pages/portfolio.jsx` | Investor portfolio & transfer |
| `frontend/src/pages/apply.jsx` | Startup application form |
| `frontend/.env.local` | Frontend env (NEXT_PUBLIC_API_URL) |
| `frontend/next.config.js` | Next.js configuration |
| `frontend/vercel.json` | Vercel deployment config |

---

## PHASE 10 — After Redeployment Checklist

After every new smart contract deployment, you **must** update:

- [ ] `frontend/src/pages/admin.jsx` → `CONTRACT_ADDRESS` constant
- [ ] Backend `applications[0].contractAddress` if seeding a demo project
- [ ] Verify contract on BscScan (optional but recommended)
- [ ] Update `address_log.txt` (auto-updated by deploy script)
