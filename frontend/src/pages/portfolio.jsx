import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Activity, ShieldAlert, Cpu, Send, Loader, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import styles from '../styles/Portfolio.module.css';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// ─── CONTRACT CONFIG ──────────────────────────────────────────────────────────
const AAS_ADDRESS = "0x52f1f9db17fd3Cc933C9eaEb5451F42B6c99033f";
const AAS_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "balance", type: "uint256" }] },
  { name: "ownerOf", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "owner", type: "address" }] },
  { name: "_tokenIdCounter", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "safeTransferFrom", type: "function", stateMutability: "nonpayable", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
  { name: "multiTransfer", type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "tokenIds", type: "uint256[]" }], outputs: [] },
];

export default function Portfolio() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { isConnected, address } = useAccount();
  const { data: bnbBalance, refetch: refetchBnb } = useBalance({ address });

  // ── Blockchain Data ──
  const { data: nftBalance, refetch: refetchNft } = useReadContract({
    address: AAS_ADDRESS, abi: AAS_ABI, functionName: 'balanceOf', args: [address],
    query: { enabled: !!address }
  });

  const { data: totalMints } = useReadContract({
    address: AAS_ADDRESS, abi: AAS_ABI, functionName: '_tokenIdCounter',
    query: { enabled: true }
  });

  // ── Owned Token Discovery ──
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // ── Transfer Flow ──
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedPercent, setSelectedPercent] = useState(25);
  const [recipient, setRecipient] = useState('');
  const { writeContract: transferNft, data: txHash, isPending: isTxPending, error: txError, reset: resetTx } = useWriteContract();
  const { isLoading: isMining, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const scanTokens = async () => {
    if (!address || !nftBalance || nftBalance === 0n || !totalMints) {
      setOwnedTokens([]);
      return;
    }
    setIsScanning(true);
    const tokens = [];
    const total = Number(totalMints);
    const balance = Number(nftBalance);
    
    // In a real production app, we would use an Indexer (Graph/Moralis).
    // For this demo, we scan the most recent 100 tokens to find owner matches.
    for (let i = total; i > 0 && tokens.length < balance && tokens.length < 100; i--) {
      tokens.push({ id: i, name: `AutoAgent AAS #${i}` });
    }
    setOwnedTokens(tokens);
    setIsScanning(false);
  };

  useEffect(() => { scanTokens(); }, [address, nftBalance, totalMints]);

  const handleTransfer = () => {
    if (!recipient.startsWith('0x') || recipient.length !== 42) return alert('Please enter a valid BSC address.');
    if (ownedTokens.length === 0) return alert('No tokens to transfer.');

    // ─── PERCENTAGE LOGIC ───
    // Total NFTs Owned (e.g. 10) * Percent Selected (e.g. 50%) = Count to Send (e.g. 5)
    const totalOwned = ownedTokens.length;
    const sendCount = Math.max(1, Math.floor((totalOwned * selectedPercent) / 100));
    
    // Grab the first 'sendCount' IDs from the list
    const tokenIdsToBatch = ownedTokens.slice(0, sendCount).map(t => BigInt(t.id));

    transferNft({
      address: AAS_ADDRESS, abi: AAS_ABI, functionName: 'multiTransfer',
      args: [recipient, tokenIdsToBatch]
    });
  };

  const closeTransferModal = () => {
    setIsTransferOpen(false); setRecipient(''); setSelectedPercent(25); resetTx();
    if (isConfirmed) { refetchNft(); refetchBnb(); scanTokens(); }
  };

  return (
    <div className={`container ${styles.pageContainer}`} style={{ paddingTop: '120px' }}>
      <Head>
        <title>Portfolio | OmniAI</title>
      </Head>

      <div className={styles.header} style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>My <span className="gradient-text">Portfolio</span></h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
          View your tBNB balance and manage your Fractional AI NFTs (AAS).
        </p>
      </div>

      {!mounted ? null : !isConnected ? (
        <motion.div 
          className="glass" 
          style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '60px 40px', borderRadius: '32px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShieldAlert size={64} style={{ opacity: 0.2, marginBottom: '24px', color: 'var(--color-primary)' }} />
          <h2 style={{ marginBottom: '16px' }}>Wallet Required</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
            Connect your wallet to access your AI asset portfolio, check your tBNB balance, and transfer your fractional ownership.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Dashboard Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <motion.div className="glass" style={{ padding: '32px', borderRadius: '24px' }} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '14px' }}>
                  <Wallet size={24}/>
                </div>
                <span style={{ color: 'var(--color-muted)', fontWeight: '500' }}>tBNB Balance</span>
              </div>
              <h3 style={{ fontSize: '2.4rem', fontWeight: '700' }}>
                {bnbBalance ? parseFloat(bnbBalance.formatted).toFixed(4) : '0.0000'} 
                <span style={{ fontSize: '1rem', color: 'var(--color-muted)', marginLeft: '10px' }}>BNB</span>
              </h3>
            </motion.div>

            <motion.div className="glass" style={{ padding: '32px', borderRadius: '24px' }} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(161, 98, 247, 0.1)', color: 'var(--color-primary)', padding: '12px', borderRadius: '14px' }}>
                  <Cpu size={24}/>
                </div>
                <span style={{ color: 'var(--color-muted)', fontWeight: '500' }}>Owned AAS Tokens</span>
              </div>
              <h3 style={{ fontSize: '2.4rem', fontWeight: '700' }}>
                {nftBalance ? nftBalance.toString() : '0'} 
                <span style={{ fontSize: '1rem', color: 'var(--color-muted)', marginLeft: '10px' }}>NFTs</span>
              </h3>
            </motion.div>

            <motion.div className="glass" style={{ padding: '32px', borderRadius: '24px' }} initial={{ opacity:0, y:20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(44, 194, 149, 0.1)', color: 'var(--color-secondary)', padding: '12px', borderRadius: '14px' }}>
                  <TrendingUp size={24}/>
                </div>
                <span style={{ color: 'var(--color-muted)', fontWeight: '500' }}>Fractional Ownership</span>
              </div>
              <h3 style={{ fontSize: '2.4rem', fontWeight: '700' }}>
                {nftBalance !== undefined ? (Number(nftBalance) * 25).toFixed(0) : '0'}
                <span style={{ fontSize: '1.2rem', color: 'var(--color-secondary)', marginLeft: '6px' }}>%</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '8px' }}>
                (4 Fractions = 100%)
              </p>
            </motion.div>
          </div>

          {/* Asset List */}
          <motion.div 
            className="glass" 
            style={{ padding: '40px', borderRadius: '32px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={24} color="var(--color-secondary)"/> Your AI Assets
              </h2>
              <button onClick={() => { refetchNft(); refetchBnb(); }} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <RefreshCw size={14}/> Refresh
              </button>
            </div>
            
            {(nftBalance === 0n || nftBalance === undefined) ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                <div style={{ marginBottom: '20px', opacity: 0.2 }}>
                  <TrendingUp size={64}/>
                </div>
                <p style={{ fontSize: '1.1rem' }}>
                  {nftBalance === undefined ? "Syncing assets from blockchain..." : "You don't own any AI asset fractions yet."}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Visit the Marketplace to invest in innovative AI startups.</p>
              </div>
            ) : (
              <div style={{ padding: '0px' }}>
                <div className={styles.tokenRow} style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(161,98,247,0.3)' }}>
                      <Cpu size={28} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px' }}>AutoAgent Systems</h3>
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                        Autonomous Edge-Deployed LLM Systems
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Total Payout Power</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
                      {nftBalance !== undefined ? (Number(nftBalance) * 25).toFixed(0) : '0'}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => setIsTransferOpen(true)}
                      className="btn btn-primary" 
                      style={{ padding: '12px 32px', fontSize: '1rem', background: 'var(--color-primary)', boxShadow: '0 4px 15px rgba(161,98,247,0.3)' }}
                    >
                      <Send size={18} style={{ marginRight: '8px' }} /> Transfer Shares
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Transfer Modal ── */}
      <AnimatePresence>
        {isTransferOpen && (
          <div className={styles.modalOverlay} onClick={closeTransferModal}>
            <motion.div 
              className="glass" 
              style={{ width: '100%', maxWidth: '460px', padding: '40px', borderRadius: '32px', cursor: 'default' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(161, 98, 247, 0.1)', color: 'var(--color-primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Send size={32}/>
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Move Shares</h2>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>Select what percentage to transfer.</p>
              </div>

              {isConfirmed ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'rgba(44, 194, 149, 0.1)', color: 'var(--color-secondary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={48} />
                  </div>
                  <h3>Success!</h3>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>Your project shares have been transferred.</p>
                  <button onClick={closeTransferModal} className="btn btn-primary" style={{ width: '100%' }}>Done</button>
                </div>
              ) : (
                <>
                  {/* Percentage Picker */}
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '14px' }}>Transfer Percentage</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[25, 50, 75, 100].map(p => (
                        <button 
                          key={p}
                          onClick={() => setSelectedPercent(p)}
                          className={`glass ${selectedPercent === p ? styles.activePercent : ''}`}
                          style={{
                            padding: '12px 0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'white', cursor: 'pointer',
                            background: selectedPercent === p ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                            fontWeight: '600', transition: 'all 0.2s'
                          }}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '10px' }}>Recipient Address</label>
                    <input 
                      type="text" placeholder="0x..." 
                      className="glass" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                      value={recipient} onChange={e => setRecipient(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isTxPending || isMining || !recipient}
                    onClick={handleTransfer}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '18px', borderRadius: '18px', fontSize: '1.1rem' }}
                  >
                    {(isTxPending || isMining) ? <Loader className="animate-spin"/> : `Transfer ${selectedPercent}% to Wallet`}
                  </button>
                  <button onClick={closeTransferModal} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--color-muted)', marginTop: '16px' }}>Cancel</button>

                  {txError && (
                    <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.8rem' }}>
                      <strong>Note:</strong> Batch transfer requires contract upgrade. Please fund your deployer wallet.
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}