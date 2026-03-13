import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, HandCoins, Activity, ShieldAlert, Cpu } from 'lucide-react';
import styles from '../styles/Investors.module.css';
import { useAccount, useReadContract } from 'wagmi';

const ContractAddress = "0x610178dA211FEF7fcB22524aC67D417bC0e6FeD3";
const OmniAIMarketABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Investors() {
  const { isConnected, address } = useAccount();

  // Read real-time token balance from blockchain
  const { data: autoAgentBalance } = useReadContract({
    address: ContractAddress,
    abi: OmniAIMarketABI,
    functionName: 'balanceOf',
    args: [address, 1], // Project ID 1 is AutoAgent Systems on our local node
    query: {
      enabled: Boolean(address),
      refetchInterval: 2000, // Poll every 2 seconds for live updates
    }
  });

  const hasAutoAgentTokens = autoAgentBalance && autoAgentBalance > 0n;
  const autoAgentTokens = hasAutoAgentTokens ? Number(autoAgentBalance) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const portfolio = [
    {
      id: 1,
      name: "MedAI Diagnostics",
      tokens: 1540,
      value: "$18,500.00",
      unclaimedYield: "$210.50",
      status: "Active Yielding"
    },
    {
      id: 2,
      name: "RenderNet V2",
      tokens: 850,
      value: "$4,250.00",
      unclaimedYield: "$85.00",
      status: "Active Yielding"
    },
    {
      id: 3,
      name: "DePIN Compute Node",
      tokens: 2200,
      value: "$24,200.00",
      unclaimedYield: "$415.75",
      status: "Active Yielding"
    }
  ];

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Head>
        <title>Investor Dashboard | OmniAI</title>
      </Head>

      <div className={styles.header}>
        <h1>Investor <span className="gradient-text">Portfolio</span></h1>
        {isConnected ? (
          <p>Connected Wallet: <span style={{ color: 'var(--color-primary)' }}>{address?.slice(0, 6)}...{address?.slice(-4)}</span></p>
        ) : (
          <p>Connect your wallet to view your real-world AI assets.</p>
        )}
      </div>

      {!isConnected ? (
        <motion.div 
          className={`glass ${styles.formContainer}`} 
          style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '60px 20px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ color: 'var(--color-muted)', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <ShieldAlert size={64} style={{ opacity: 0.5 }} />
          </div>
          <h2 style={{ marginBottom: '16px' }}>Wallet Not Connected</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
            Please connect your decentralized wallet to access your RWA token portfolio, view your automated yields, and purchase new AI assets.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className={styles.summaryGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
        <motion.div className={`glass ${styles.summaryCard}`} variants={itemVariants}>
          <div className={styles.summaryIcon} style={{ color: 'var(--color-primary)', background: 'rgba(161, 98, 247, 0.1)' }}>
            <Wallet size={28} />
          </div>
          <div className={styles.summaryData}>
            <p>Total Value Locked</p>
            <h3>$46,950.00</h3>
          </div>
        </motion.div>

        <motion.div className={`glass ${styles.summaryCard}`} variants={itemVariants}>
          <div className={styles.summaryIcon}>
            <TrendingUp size={28} />
          </div>
          <div className={styles.summaryData}>
            <p>Total Yield Earned</p>
            <h3>$3,420.50</h3>
          </div>
        </motion.div>

        <motion.div className={`glass ${styles.summaryCard}`} variants={itemVariants}>
          <div className={styles.summaryIcon} style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <HandCoins size={28} />
          </div>
          <div className={styles.summaryData}>
            <p>Unclaimed Yield</p>
            <h3>$711.25</h3>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.portfolioSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2>Your AI Assets</h2>
        <div className={`glass ${styles.tableContainer}`}>
          <table className={styles.portfolioTable}>
            <thead>
              <tr>
                <th>Asset / Project</th>
                <th>Tokens Held</th>
                <th>Current Value</th>
                <th>Unclaimed Yield</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Inject Real Blockchain Token Row if user owns F-NFTs */}
              {hasAutoAgentTokens && (
                <tr style={{ background: 'rgba(44, 194, 149, 0.05)', boxShadow: 'inset 2px 0 0 var(--color-secondary)' }}>
                  <td className={styles.projectName}>
                    <Cpu size={18} color="var(--color-secondary)" />
                    AutoAgent Systems <span style={{fontSize: '0.7rem', background: 'var(--color-secondary)', color: '#000', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>NEW</span>
                  </td>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>{autoAgentTokens.toLocaleString()}</td>
                  <td style={{ fontWeight: '500' }}>${(autoAgentTokens * 1).toLocaleString()}.00</td>
                  <td style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>
                    $0.00
                  </td>
                  <td>
                    <button className={`btn btn-outline ${styles.claimBtn}`} disabled>
                      Yield Accruing...
                    </button>
                  </td>
                </tr>
              )}

              {portfolio.map((asset) => (
                <tr key={asset.id}>
                  <td className={styles.projectName}>
                    <Activity size={18} color="var(--color-primary)" />
                    {asset.name}
                  </td>
                  <td>{asset.tokens.toLocaleString()}</td>
                  <td style={{ fontWeight: '500' }}>{asset.value}</td>
                  <td style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>
                    {asset.unclaimedYield}
                  </td>
                  <td>
                    <button className={`btn btn-outline ${styles.claimBtn}`}>
                      Claim Yield
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
}