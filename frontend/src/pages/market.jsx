import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cpu, Image as ImageIcon, Briefcase, Activity, X, CheckCircle, AlertTriangle, ExternalLink, Wallet } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Market.module.css';

// ─── CONTRACT CONFIG ────────────────────────────────────────────────────────
// AIProjectFactory deployed on BSC Testnet
const CONTRACT_ADDRESS = "0x52f1f9db17fd3Cc933C9eaEb5451F42B6c99033f";
const BSC_TESTNET_CHAIN_ID = 97;
const BSC_TESTNET_EXPLORER = "https://testnet.bscscan.com";

const AutoAgentSystemABI = [
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "uint256", name: "sharesRequested", type: "uint256" }
    ],
    name: "invest",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
// ────────────────────────────────────────────────────────────────────────────

export default function Market() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [txError, setTxError] = useState(null);
  const [dynamicProjects, setDynamicProjects] = useState([]);

  // Wallet & chain state
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== BSC_TESTNET_CHAIN_ID;

  // Wagmi write hook
  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  // Wait for confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Propagate write errors to UI
  useEffect(() => {
    if (writeError) {
      setTxError(writeError.shortMessage || writeError.message || "Transaction failed. Please try again.");
    }
  }, [writeError]);

  // Fetch backend approved projects
  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/applications?status=Active');
        const data = await res.json();
        const getIcon = (cat) => {
          if (cat.includes('Vision')) return <ImageIcon size={24} />;
          if (cat.includes('Health')) return <Activity size={24} />;
          if (cat.includes('Finance')) return <Briefcase size={24} />;
          if (cat.includes('LLM') || cat.includes('Gen')) return <Database size={24} />;
          return <Cpu size={24} />;
        };
        const formatted = data.map(app => ({
          id: app.id,
          name: app.name,
          category: app.category,
          desc: app.desc,
          raised: app.raised || 0,
          goal: app.goal,
          tokenSupply: app.tokenSupply,
          status: "Funding",
          icon: getIcon(app.category),
          apy: app.apy,
          contractAddress: app.contractAddress,
          explorerLink: app.explorerLink,
        }));
        setDynamicProjects(formatted);
      } catch (e) {
        console.error("Could not load backend projects", e);
      }
    };
    fetchApproved();
  }, []);

  // Reset modal state when closed
  const handleCloseModal = () => {
    setSelectedProject(null);
    setInvestAmount('');
    setTxError(null);
    resetWrite();
  };

  // Main invest handler
  const handleInvest = () => {
    if (!investAmount || parseFloat(investAmount) <= 0) return;
    setTxError(null);
    try {
      // Calculate shares: for now 1 BNB = 10,000 shares for test
      // Or use the project supply/goal ratio if available
      const sharesRequested = Math.floor(parseFloat(investAmount) * 10000);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: AutoAgentSystemABI,
        functionName: 'invest',
        args: [BigInt(selectedProject.id || 1), BigInt(sharesRequested)],
        value: parseEther(investAmount.toString()),
        chainId: BSC_TESTNET_CHAIN_ID,
      });
    } catch (err) {
      console.error("Tx error:", err);
      setTxError(err?.shortMessage || "Transaction rejected.");
    }
  };

  const categories = ['All', 'LLMs', 'Healthcare', 'Computer Vision', 'DePIN', 'Autonomous Agents'];

  const projects = [
    { id: 1, name: "MedAI Diagnostics", category: "Healthcare", desc: "Training a specialized multimodal LLM for preliminary radiological diagnostics. Requires H100 GPU clusters for 3 months.", raised: 150000, goal: 200000, status: "Funding", icon: <Activity size={24} />, apy: "12-15%" },
    { id: 2, name: "Nexus Foundation Model", category: "LLMs", desc: "An open-weight foundation model optimizing context window size up to 1M tokens. Seeking compute funding.", raised: 450000, goal: 500000, status: "Funding", icon: <Database size={24} />, apy: "10-18%" },
    { id: 3, name: "RenderNet V2", category: "Computer Vision", desc: "Next-gen diffusion model for real-time 3D asset generation for indie game developers.", raised: 80000, goal: 120000, status: "Funding", icon: <ImageIcon size={24} />, apy: "14-20%" },
    { id: 4, name: "DePIN Compute Node", category: "DePIN", desc: "Decentralized GPU node deployment for offering serverless AI inference via distributed network.", raised: 300000, goal: 300000, status: "Funded", icon: <Cpu size={24} />, apy: "9-12%" },
    { id: 5, name: "FinQuant LLM", category: "Finance", desc: "Financial data extraction agent specifically trained on a decade of enterprise SEC filings and earnings calls.", raised: 50000, goal: 250000, status: "Funding", icon: <Briefcase size={24} />, apy: "15-22%" },
  ];

  const combinedProjects = [...projects.slice(0, 5), ...dynamicProjects];
  const filteredProjects = activeFilter === 'All'
    ? combinedProjects
    : combinedProjects.filter(p => p.category === activeFilter || (p.category.includes('AI') && activeFilter === 'LLMs'));

  // Computed UI state for button label
  const isProcessing = isPending || isConfirming;
  let btnLabel = 'Confirm Transaction';
  if (isPending) btnLabel = 'Confirm in Wallet…';
  if (isConfirming) btnLabel = 'Mining on Blockchain…';

  // F-NFT estimate: tokens = (BNB_value * tokenSupply) / fundingGoal (in wei)
  // Simplified display: 1 BNB = 1000 tokens at default ratio
  const bnbAmount = parseFloat(investAmount) || 0;
  const estimatedTokens = selectedProject ? Math.floor(bnbAmount * 10000) : 0;
  const ownershipPct = selectedProject ? ((estimatedTokens / (selectedProject.tokenSupply || 10000)) * 100).toFixed(4) : '0.0000';
  const monthlyYield = (bnbAmount * 0.1).toFixed(6);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Head>
        <title>Marketplace | AiCapX</title>
      </Head>

      <div className={styles.header}>
        <h1>Invest in <span className="gradient-text">AI Innovation</span></h1>
        <p>Purchase fractional ownership in vetted AI infrastructure and models. Earn yield automatically as these models generate revenue.</p>
      </div>

      {/* Wrong network banner */}
      <AnimatePresence>
        {isWrongNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#f59e0b',
            }}
          >
            <AlertTriangle size={20} />
            <span style={{ flex: 1 }}>You are on the wrong network. Please switch to <strong>BSC Testnet</strong> to invest.</span>
            <button
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => switchChain({ chainId: BSC_TESTNET_CHAIN_ID })}
            >
              Switch Network
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.filters}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeFilter === cat ? styles.active : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div className={styles.projectGrid} variants={containerVariants} initial="hidden" animate="visible">
        {filteredProjects.map((project) => {
          const progress = Math.min((project.raised / project.goal) * 100, 100);
          return (
            <motion.div key={project.id} variants={cardVariants} className={`glass ${styles.projectCard}`}>
              <div className={styles.cardHeader}>
                <div style={{ color: 'var(--color-primary)' }}>{project.icon}</div>
                <span className={styles.statusBadge} style={{
                  background: project.status === 'Funded' ? 'rgba(44, 194, 149, 0.1)' : 'rgba(161, 98, 247, 0.1)',
                  color: project.status === 'Funded' ? 'var(--color-secondary)' : 'var(--color-primary)'
                }}>
                  {project.status}
                </span>
              </div>
              <h3 className={styles.projectTitle}>{project.name}</h3>
              <p className={styles.projectDesc}>{project.desc}</p>
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <p>Est. APY</p>
                  <h5 style={{ color: 'var(--color-secondary)' }}>{project.apy}</h5>
                </div>
                <div className={styles.statItem}>
                  <p>Target</p>
                  <h5>${(project.goal).toLocaleString()}</h5>
                </div>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                  <span>Raised</span>
                  <span>${project.raised.toLocaleString()} ({progress.toFixed(0)}%)</span>
                </div>
                <div className={styles.progressBarBg}>
                  <motion.div
                    className={styles.progressBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
              <button
                className={`btn ${project.status === 'Funded' ? 'btn-outline' : 'btn-primary'} ${styles.investBtn}`}
                disabled={project.status === 'Funded'}
                onClick={() => {
                  setSelectedProject(project);
                  setInvestAmount('');
                  setTxError(null);
                  resetWrite();
                }}
              >
                {project.status === 'Funded' ? 'Trading on Secondary' : 'Invest Now'}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══════════════════ INVESTMENT MODAL ═══════════════════ */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <button className={styles.closeModalBtn} onClick={handleCloseModal}>
                <X size={24} />
              </button>

              <div className={styles.modalHeader}>
                <h2>Fund <span className="gradient-text">{selectedProject.name}</span></h2>
                <p>Acquire Fractional NFTs (F-NFTs) to earn a share of future AI revenue.</p>
              </div>

              {/* ── Success State ── */}
              {isConfirmed ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ color: 'var(--color-secondary)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
                  >
                    <CheckCircle size={64} />
                  </motion.div>
                  <h3 style={{ marginBottom: '12px' }}>Investment Successful! 🎉</h3>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--color-text)' }}>{estimatedTokens.toLocaleString()} F-NFT tokens</strong> have been minted to your wallet.
                  </p>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
                    You have successfully funded <strong style={{ color: 'var(--color-text)' }}>{selectedProject.name}</strong>. Check your Investor Dashboard to see your new AI assets.
                  </p>
                  {hash && (
                    <a
                      href={`${BSC_TESTNET_EXPLORER}/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', marginBottom: '24px', fontSize: '0.9rem' }}
                    >
                      View on BscScan <ExternalLink size={14} />
                    </a>
                  )}
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseModal}>
                    Return to Marketplace
                  </button>
                </div>

              ) : !mounted ? null : !isConnected ? (
                /* ── Not Connected State ── */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ color: 'var(--color-muted)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Wallet size={48} style={{ opacity: 0.5 }} />
                  </div>
                  <h3 style={{ marginBottom: '12px' }}>Connect Your Wallet</h3>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
                    You need to connect a Web3 wallet to invest in AI projects and receive your F-NFTs.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ConnectButton />
                  </div>
                </div>

              ) : isWrongNetwork ? (
                /* ── Wrong Network State ── */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <AlertTriangle size={48} />
                  </div>
                  <h3 style={{ marginBottom: '12px' }}>Wrong Network</h3>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
                    This contract is deployed on <strong style={{ color: 'var(--color-text)' }}>BSC Testnet</strong>. Please switch your network to continue.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => switchChain({ chainId: BSC_TESTNET_CHAIN_ID })}>
                    Switch to BSC Testnet
                  </button>
                </div>

              ) : (
                /* ── Main Invest Form ── */
                <>
                  <div className={styles.investInputGroup}>
                    <label>Investment Amount</label>
                    <div className={styles.investInputWrapper}>
                      <input
                        type="number"
                        placeholder="0.0001"
                        min="0.0001"
                        step="0.0001"
                        className={styles.investInput}
                        value={investAmount}
                        onChange={(e) => {
                          setInvestAmount(e.target.value);
                          setTxError(null);
                        }}
                        disabled={isProcessing}
                      />
                      <span className={styles.currencyLabel}>BNB</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '6px' }}>
                      Connected: <span style={{ color: 'var(--color-primary)' }}>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </p>
                  </div>

                  <div className={styles.payoutPreview}>
                    <div className={styles.previewRow}>
                      <p>Estimated F-NFTs Received:</p>
                      <span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>
                        {estimatedTokens.toLocaleString()} Tokens
                      </span>
                    </div>
                    <div className={styles.previewRow}>
                      <p>Ownership Share:</p>
                      <span style={{ color: 'var(--color-primary)' }}>{ownershipPct}%</span>
                    </div>
                    <div className={styles.previewRow}>
                      <p>Estimated Monthly Yield:</p>
                      <span>{bnbAmount > 0 ? `${monthlyYield} BNB` : '—'}</span>
                    </div>
                    <div className={styles.previewRow}>
                      <p>Network:</p>
                      <span style={{ color: 'var(--color-secondary)', fontSize: '0.85rem' }}>BSC Testnet ✓</span>
                    </div>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {investAmount && parseFloat(investAmount) < 0.0001 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          color: '#ef4444',
                          fontSize: '0.85rem',
                        }}
                      >
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Minimum investment requirement: 0.0001 BNB</span>
                      </motion.div>
                    )}
                    {txError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          color: '#ef4444',
                          fontSize: '0.85rem',
                        }}
                      >
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{txError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hash pending confirmation */}
                  <AnimatePresence>
                    {hash && isConfirming && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', marginBottom: '12px' }}
                      >
                        <a
                          href={`${BSC_TESTNET_EXPLORER}/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Tx submitted → View on BscScan <ExternalLink size={12} />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={styles.actionRow}>
                    <button className="btn btn-outline" onClick={handleCloseModal} disabled={isProcessing}>
                      Cancel
                    </button>
                    <button
                      id="confirm-invest-btn"
                      className="btn btn-primary"
                      disabled={!investAmount || parseFloat(investAmount) < 0.0001 || isProcessing}
                      onClick={handleInvest}
                      style={{ minWidth: '200px', position: 'relative', overflow: 'hidden' }}
                    >
                      {isProcessing && (
                        <span style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          marginRight: '8px',
                          verticalAlign: 'middle',
                        }} />
                      )}
                      {btnLabel}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
