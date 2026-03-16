import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader, RefreshCw, DollarSign, CheckCircle, X, Sparkles,
  Settings, ShieldAlert, AlertTriangle, Users, FileText,
  Download, Video, ExternalLink, Activity, Eye
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Admin.module.css';

// ─── CONTRACT CONFIG ──────────────────────────────────────────────────────────
// Update this address after deploying AiRegistration.sol
// npx hardhat run scripts/deployAiRegistration.js --network bscTestnet
const CONTRACT_ADDRESS  = "0x52f1f9db17fd3Cc933C9eaEb5451F42B6c99033f"; // ← replace after deploy
const BSC_TESTNET_CHAIN = 97;
const BSC_EXPLORER      = "https://testnet.bscscan.com";
const ADMIN_WALLET      = "0x26c74Dbb12040851321940cB0dE3E409AB6B5E74";

// AiRegistration ABI — mint() is ONE transaction (no two-step flow needed)
const SOLAR_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "owners",      type: "address[]" },
      { name: "amounts",     type: "uint256[]" },
      { name: "name",        type: "string"    },
      { name: "description", type: "string"    },
    ],
    outputs: [],
  },
  {
    name: "transferFractionalOwnership",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",      type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "burnFractionalOwnership",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from",    type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getSolarTokenById",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "tokenId",           type: "uint256"   },
      { name: "name",              type: "string"    },
      { name: "description",       type: "string"    },
      { name: "fractinalOwners",   type: "address[]" },
      { name: "fractionalAmounts", type: "uint256[]" },
    ]}],
  },
  {
    name: "_tokenIdCounter",
    type: "function",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const TABS = { QUEUE: 'queue', ACTIVE: 'active' };

export default function Admin() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { isConnected, address } = useAccount();
  const isAdmin = isConnected; // Allow all addresses for testing

  // ── UI ──
  const [activeTab, setActiveTab]       = useState(TABS.QUEUE);
  const [applications, setApplications] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedApp, setSelectedApp]   = useState(null);
  const [stats, setStats]               = useState(null);

  // flowMode prevents queue effects from firing during Mint tab operation and vice-versa
  const flowMode = useRef(null); // 'queue' | 'mint' | null

  // ── Queue flow ──
  const [processingId, setProcessingId] = useState(null);
  const [txPhase, setTxPhase]           = useState('idle');
  // idle | wallet | mining | success | error
  const [txError, setTxError]           = useState(null);



  // ── Wagmi ──
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, error: mintErr, reset: resetMint } = useWriteContract();

  const { isLoading: isMinting, isSuccess: isMintOk } = useWaitForTransactionReceipt({ hash: mintHash });

  // ═══════════════════════════════════════════════
  //  QUEUE FLOW EFFECTS
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (flowMode.current !== 'queue') return;
    if (isMintPending) setTxPhase('wallet');
  }, [isMintPending]);

  useEffect(() => {
    if (flowMode.current !== 'queue') return;
    if (isMinting) setTxPhase('mining');
  }, [isMinting]);

  useEffect(() => {
    if (flowMode.current !== 'queue') return;
    if (isMintOk && mintHash && processingId != null) {
      setTxPhase('success');
      persistApproval(processingId, mintHash);
      flowMode.current = null;
    }
  }, [isMintOk]);

  useEffect(() => {
    if (flowMode.current !== 'queue') return;
    if (mintErr) { setTxPhase('error'); setTxError(mintErr.shortMessage || mintErr.message); flowMode.current = null; }
  }, [mintErr]);

  // ═══════════════════════════════════════════════
  //  MINT TAB FLOW EFFECTS
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (flowMode.current !== 'mint') return;
    if (isMintPending) setMintPhase('wallet');
  }, [isMintPending]);

  useEffect(() => {
    if (flowMode.current !== 'mint') return;
    if (isMinting) setMintPhase('mining');
  }, [isMinting]);

  useEffect(() => {
    if (flowMode.current !== 'mint') return;
    if (isMintOk && mintHash) {
      setMintedHash(mintHash);
      setMintPhase('success');
      flowMode.current = null;
    }
  }, [isMintOk]);

  useEffect(() => {
    if (flowMode.current !== 'mint') return;
    if (mintErr) { setMintPhase('error'); setMintError(mintErr.shortMessage || mintErr.message); flowMode.current = null; }
  }, [mintErr]);

  // ═══════════════════════════════════════════════
  //  DATA
  // ═══════════════════════════════════════════════
  useEffect(() => { fetchApplications(); fetchActiveProjects(); fetchStats(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try { setApplications(await (await fetch('http://localhost:8000/api/applications?status=Under Review')).json()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchActiveProjects = async () => {
    try { setActiveProjects(await (await fetch('http://localhost:8000/api/applications?status=Active')).json()); }
    catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try { setStats(await (await fetch('http://localhost:8000/api/stats')).json()); }
    catch (e) { console.error(e); }
  };

  // ═══════════════════════════════════════════════
  //  QUEUE: Approve & Mint (single SolarRegistration.mint() call)
  // ═══════════════════════════════════════════════
  const handleQueueApprove = async (app) => {
    setTxError(null);
    setTxPhase('wallet'); // Reuse phase for loading state
    setProcessingId(app.id);
    flowMode.current = 'queue';
    
    try {
      // Just update the backend status to 'Active' to list it in the marketplace
      await persistApproval(app.id, "Pending Mint");
      setTxPhase('success');
      fetchApplications();
      fetchActiveProjects();
      fetchStats();
    } catch (err) {
      setTxError(err.message || "Failed to approve project");
      setTxPhase('error');
    }
  };

  const persistApproval = async (appId, txHash) => {
    try {
      await fetch(`http://localhost:8000/api/applications/${appId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Active', contractAddress: CONTRACT_ADDRESS,
          mintTxHash: txHash, explorerLink: `${BSC_EXPLORER}/tx/${txHash}`,
        }),
      });
      setApplications(prev => prev.filter(a => a.id !== appId));
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const handleReject = async (app) => {
    try {
      await fetch(`http://localhost:8000/api/applications/${app.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      setApplications(prev => prev.filter(a => a.id !== app.id));
      setSelectedApp(null); fetchStats();
    } catch (e) { console.error(e); }
  };



  // ── Helpers ──
  const isBusy    = ['wallet','mining'].includes(txPhase);

  const queueLabel = () => {
    if (txPhase === 'wallet')  return 'Approving Project…';
    if (txPhase === 'mining')  return 'Syncing…';
    if (txPhase === 'success') return '✅ Project Listed in Marketplace!';
    if (txPhase === 'error')   return '❌ Approval Failed';
    return 'Approve Project';
  };

  const mintBtnLabel = () => {
    if (mintPhase === 'wallet') return 'Confirm in Wallet…';
    if (mintPhase === 'mining') return 'Minting on BSC Testnet…';
    return 'Mint Fractional NFT';
  };

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="container" style={{ padding: '120px 24px 80px', minHeight: '100vh', maxWidth: '1150px', margin: '0 auto' }}>
      <Head><title>Admin Command Center | AiCapX</title></Head>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <h1 style={{ fontSize: '2.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
          <Settings size={38} color="var(--color-secondary)" />
          Admin <span className="gradient-text">Command Center</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem' }}>
          Review Applications · Verify AI Assets · Mint AutoAgent F-NFTs
        </p>
      </div>

      {/* Auth Gates */}
      {!mounted ? null : !isConnected ? (
        <div className="glass" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '56px 24px' }}>
          <ShieldAlert size={56} style={{ opacity: 0.35, marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Admin Login Required</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '28px' }}>Connect the contract owner wallet.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}><ConnectButton /></div>
        </div>

      ) : (
        <>
          {/* Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
              {[
                { label:'Under Review', value: stats.pending,   color:'#f59e0b' },
                { label:'Active',       value: stats.active,    color:'var(--color-secondary)' },
                { label:'Rejected',     value: stats.rejected,  color:'#ef4444' },
                { label:'Total Raised', value:`$${(stats.totalRaised||0).toLocaleString()}`, color:'var(--color-primary)' },
              ].map(s=>(
                <div key={s.label} className="glass" style={{ padding:'16px 20px', borderRadius:'14px' }}>
                  <p style={{ fontSize:'0.78rem', color:'var(--color-muted)', marginBottom:'4px' }}>{s.label}</p>
                  <p style={{ fontSize:'1.6rem', fontWeight:'700', color:s.color }}>{s.value}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab Bar */}
          <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'28px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id:TABS.QUEUE, label:'Pending Queue', icon:<Users size={15}/>,    badge:applications.length },
              { id:TABS.ACTIVE, label:'Approved List', icon:<CheckCircle size={15}/>, badge:activeProjects.length },
            ].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 22px', background:'none', border:'none', cursor:'pointer', fontSize:'0.9rem', borderBottom:activeTab===t.id?'2px solid var(--color-secondary)':'2px solid transparent', color:activeTab===t.id?'white':'var(--color-muted)', fontWeight:activeTab===t.id?'600':'400', marginBottom:'-1px', transition:'all 0.2s' }}>
                {t.icon}{t.label}
                {t.badge!=null && <span style={{ background:t.badge>0?'var(--color-primary)':'rgba(255,255,255,0.1)', color:'white', fontSize:'0.68rem', fontWeight:'700', padding:'2px 7px', borderRadius:'20px' }}>{t.badge}</span>}
              </button>
            ))}

          </div>

          {/* ══ TABS CONTENT ══ */}
          <AnimatePresence mode="wait">
            {activeTab === TABS.QUEUE && (
              <motion.div key="queue" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                {loading ? (
                  <p style={{ textAlign:'center', color:'var(--color-muted)', padding:'60px' }}>Fetching applications…</p>
                ) : applications.length === 0 ? (
                  <div className="glass" style={{ textAlign:'center', padding:'80px', color:'var(--color-muted)' }}>
                    <CheckCircle size={56} style={{ opacity:0.2, marginBottom:'16px' }} />
                    <p style={{ fontSize:'1.1rem' }}>Queue is empty — all reviewed.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {applications.map(app=>(
                      <motion.div key={app.id} className="glass"
                        style={{ padding:'22px 28px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                        whileHover={{ borderColor:'rgba(161,98,247,0.4)', background:'rgba(255,255,255,0.02)' }}
                        onClick={()=>{ setSelectedApp(app); setTxPhase('idle'); setTxError(null); }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                            <h3 style={{ fontSize:'1.2rem' }}>{app.name}</h3>
                            <span style={{ fontSize:'0.7rem', background:'rgba(245,158,11,0.1)', color:'#f59e0b', padding:'3px 8px', borderRadius:'20px', fontWeight:'600' }}>● UNDER REVIEW</span>
                          </div>
                          <p style={{ color:'var(--color-muted)', fontSize:'0.82rem' }}>{app.startupName} · {app.category} · {app.founderName}</p>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ fontWeight:'700', fontSize:'1.1rem' }}>${app.goal?.toLocaleString()}</p>
                          <p style={{ fontSize:'0.78rem', color:'var(--color-muted)' }}>{app.tokenSupply?.toLocaleString()} fractions</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === TABS.ACTIVE && (
              <motion.div key="active" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                {activeProjects.length === 0 ? (
                  <div className="glass" style={{ textAlign:'center', padding:'80px', color:'var(--color-muted)' }}>
                    <p style={{ fontSize:'1.1rem' }}>No approved projects yet.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {activeProjects.map(app=>(
                      <div key={app.id} className="glass" style={{ padding:'22px 28px', border:'1px solid rgba(44, 194, 149, 0.2)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(44, 194, 149, 0.02)' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                            <h3 style={{ fontSize:'1.2rem' }}>{app.name}</h3>
                            <span style={{ fontSize:'0.7rem', background:'rgba(44, 194, 149, 0.1)', color:'var(--color-secondary)', padding:'3px 8px', borderRadius:'20px', fontWeight:'600' }}>● LIVE ON MARKET</span>
                          </div>
                          <p style={{ color:'var(--color-muted)', fontSize:'0.82rem' }}>{app.startupName} · {app.category}</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ color:'var(--color-secondary)', fontWeight:'700', fontSize:'1.1rem' }}>ACTIVE</p>
                          <p style={{ fontSize:'0.78rem', color:'var(--color-muted)' }}>Approved on {new Date(app.updatedAt || app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ══ PROJECT REVIEW MODAL ══ */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div className={styles.modalOverlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className={styles.modalContent}
              style={{ maxWidth:'960px', width:'95%', maxHeight:'92vh', overflowY:'auto' }}
              initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px' }}>
                <div>
                  <h2 style={{ fontSize:'1.8rem', marginBottom:'4px' }}>Review <span className="gradient-text">{selectedApp.name}</span></h2>
                  <p style={{ color:'var(--color-muted)', fontSize:'0.85rem' }}>{selectedApp.startupName} · Submitted {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={()=>setSelectedApp(null)} style={{ background:'none', border:'none', color:'var(--color-muted)', cursor:'pointer', padding:'4px' }}>
                  <X size={22}/>
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {txError && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'12px 16px', marginBottom:'18px', display:'flex', gap:'8px', color:'#ef4444', fontSize:'0.85rem' }}>
                    <AlertTriangle size={15} style={{ flexShrink:0 }}/>{txError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'28px' }}>
                {/* Left */}
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><Users size={15}/> Founder & Company</h4>
                    <div className="glass" style={{ padding:'16px', background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', gap:'9px', fontSize:'0.87rem' }}>
                      {[['Founder',selectedApp.founderName],['Email',selectedApp.founderEmail||'—'],['Entity',selectedApp.startupName],['Country',selectedApp.country||'—'],['Wallet',selectedApp.startupWallet]].map(([k,v])=>(
                        <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:'8px' }}>
                          <span style={{ color:'var(--color-muted)', flexShrink:0 }}>{k}:</span>
                          <span style={{ wordBreak:'break-all', textAlign:'right', fontFamily:k==='Wallet'?'monospace':'inherit', fontSize:k==='Wallet'?'0.74rem':'inherit' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><FileText size={15}/> KYC/KYB Documents</h4>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {(selectedApp.documents?.length?selectedApp.documents:['No documents']).map((doc,i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'7px 12px', fontSize:'0.8rem' }}>
                          <FileText size={13} color="#64748b"/>{doc}<Download size={12} style={{ color:'var(--color-muted)', cursor:'pointer', marginLeft:'4px' }}/>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><Video size={15}/> Demo Video</h4>
                    <a href={selectedApp.demoVideo||'#'} target="_blank" rel="noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'13px 16px', color:'var(--color-primary)', textDecoration:'none', fontSize:'0.86rem' }}>
                      <Video size={15}/>{selectedApp.demoVideo||'No demo'}<ExternalLink size={12} style={{ marginLeft:'auto' }}/>
                    </a>
                  </section>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><DollarSign size={15}/> Revenue Proof</h4>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'12px 16px', fontSize:'0.86rem' }}>
                      <FileText size={14} color="var(--color-secondary)"/>{selectedApp.revenueProof||'None'}
                      {selectedApp.revenueProof&&<Download size={13} style={{ color:'var(--color-muted)', cursor:'pointer', marginLeft:'auto' }}/>}
                    </div>
                  </section>
                </div>

                {/* Right */}
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><Activity size={15}/> Parameters</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                      {[
                        { label:'Funding Goal', value:`$${selectedApp.goal?.toLocaleString()}`,     color:'var(--color-secondary)' },
                        { label:'F-NFT Supply', value:`${selectedApp.tokenSupply?.toLocaleString()}`, color:'white' },
                        { label:'Token Price',  value:`$${selectedApp.tokenPrice?.toFixed(2)||'—'}`, color:'var(--color-primary)' },
                        { label:'Users',        value:`${selectedApp.userCount?.toLocaleString()||'0'}`, color:'white' },
                        { label:'Category',     value: selectedApp.category,  color:'white' },
                        { label:'APY',          value: selectedApp.apy||'—',  color:'var(--color-secondary)' },
                      ].map(s=>(
                        <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginBottom:'4px' }}>{s.label}</p>
                          <p style={{ fontSize:'1rem', fontWeight:'600', color:s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 style={{ color:'var(--color-secondary)', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.04em' }}><Eye size={15}/> Description</h4>
                    <p style={{ color:'var(--color-muted)', lineHeight:'1.7', fontSize:'0.87rem', background:'rgba(255,255,255,0.02)', padding:'14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' }}>
                      {selectedApp.desc||'No description.'}
                    </p>
                  </section>

                  {/* Approval Information */}
                  <div style={{ background:'rgba(161,98,247,0.05)', border:'1px solid rgba(161,98,247,0.15)', borderRadius:'10px', padding:'14px 18px', fontSize:'0.83rem' }}>
                    <p style={{ color:'var(--color-secondary)', fontWeight:'600', marginBottom:'8px' }}>Marketplace Listing Notice:</p>
                    <p style={{ color:'var(--color-muted)', lineHeight:'1.6' }}>
                      Approving this project will instantly list it in the public Marketplace. Users will be able to view details and invest in shares.
                    </p>
                  </div>

                  {/* Tx Status */}
                  {txPhase !== 'idle' && processingId === selectedApp.id && (
                    <div style={{ background: txPhase==='success'?'rgba(44,194,149,0.08)':txPhase==='error'?'rgba(239,68,68,0.08)':'rgba(161,98,247,0.08)', border:`1px solid ${txPhase==='success'?'rgba(44,194,149,0.25)':txPhase==='error'?'rgba(239,68,68,0.25)':'rgba(161,98,247,0.25)'}`, borderRadius:'10px', padding:'13px 16px', display:'flex', alignItems:'center', gap:'10px', fontSize:'0.84rem' }}>
                      {txPhase==='success'?<CheckCircle size={15} color="var(--color-secondary)"/>:txPhase==='error'?<AlertTriangle size={15} color="#ef4444"/>:<Loader size={15} color="var(--color-primary)" style={{ animation:'spin 1s linear infinite' }}/>}
                      <span style={{ color:txPhase==='success'?'var(--color-secondary)':txPhase==='error'?'#ef4444':'white' }}>{queueLabel()}</span>
                      {mintHash && <a href={`${BSC_EXPLORER}/tx/${mintHash}`} target="_blank" rel="noreferrer" style={{ marginLeft:'auto', color:'var(--color-secondary)' }}><ExternalLink size={13}/></a>}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'14px', justifyContent:'flex-end', paddingTop:'24px', marginTop:'24px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <button className="btn btn-outline" style={{ color:'#ef4444', borderColor:'#ef4444' }}
                  onClick={()=>handleReject(selectedApp)} disabled={isBusy}>
                  Reject
                </button>
                <button className="btn btn-primary"
                  style={{ minWidth:'240px', background: txPhase==='success'?'rgba(44,194,149,0.2)':'linear-gradient(135deg,#10b981,#059669)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}
                  onClick={()=>handleQueueApprove(selectedApp)}
                  disabled={isBusy||txPhase==='success'}>
                  {isBusy
                    ? <><span style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }}/>{queueLabel()}</>
                    : txPhase==='success'?'✅ Listed & Live!'
                    : <><Sparkles size={15}/> Approve Project</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
