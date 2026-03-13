import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Settings, Users, AlertTriangle, FileText,
  Video, Activity, Sparkles, ExternalLink, Hash,
  Loader, RefreshCw, Download, Eye, Plus, Trash2,
  DollarSign, CheckCircle, X, Layers
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Admin.module.css';

// ─── CONTRACT CONFIG ──────────────────────────────────────────────────────────
// Update this address after deploying SolarRegistration.sol
// npx hardhat run scripts/deploySolarRegistration.js --network bscTestnet
const CONTRACT_ADDRESS  = "0x38118A079dA18c94D9A0772fa52A9876d065a96F"; // ← replace after deploy
const BSC_TESTNET_CHAIN = 97;
const BSC_EXPLORER      = "https://testnet.bscscan.com";
const ADMIN_WALLET      = "0x26c74Dbb12040851321940cB0dE3E409AB6B5E74";

// SolarRegistration ABI — mint() is ONE transaction (no two-step flow needed)
const SOLAR_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fractinalOwners",   type: "address[]" },
      { name: "fractionalAmounts", type: "uint256[]" },
      { name: "name",              type: "string"    },
      { name: "description",       type: "string"    },
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

const TABS = { QUEUE: 'queue', MINT: 'mint' };

export default function Admin() {
  const { isConnected, address } = useAccount();
  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  // ── UI ──
  const [activeTab, setActiveTab]       = useState(TABS.QUEUE);
  const [applications, setApplications] = useState([]);
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

  // ── Mint tab ──
  // Dynamic fractional owners table: [{ address: '', amount: '' }, ...]
  const [nftName, setNftName]           = useState('');
  const [nftDesc, setNftDesc]           = useState('');
  const [owners, setOwners]             = useState([{ address: '', amount: '' }]);
  const [mintPhase, setMintPhase]       = useState('idle');
  // idle | wallet | mining | success | error
  const [mintError, setMintError]       = useState(null);
  const [mintedHash, setMintedHash]     = useState(null);
  const [mintedTokenId, setMintedTokenId] = useState(null);

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
  useEffect(() => { fetchApplications(); fetchStats(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try { setApplications(await (await fetch('http://localhost:8000/api/applications?status=Under Review')).json()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { setStats(await (await fetch('http://localhost:8000/api/stats')).json()); }
    catch (e) { console.error(e); }
  };

  // ═══════════════════════════════════════════════
  //  QUEUE: Approve & Mint (single SolarRegistration.mint() call)
  // ═══════════════════════════════════════════════
  const handleQueueApprove = (app) => {
    setTxError(null);
    setTxPhase('idle');
    setProcessingId(app.id);
    flowMode.current = 'queue';
    resetMint();

    const treasury = app.startupWallet || ADMIN_WALLET;
    const supply   = BigInt(app.tokenSupply || 10000);

    writeMint({
      address: CONTRACT_ADDRESS, abi: SOLAR_ABI,
      functionName: 'mint',
      args: [
        [treasury],          // fractionalOwners — startup gets 100% initially
        [supply],            // fractionalAmounts
        app.name,
        app.desc || `${app.name} — RWA project on BNB Chain`,
      ],
      chainId: BSC_TESTNET_CHAIN,
    });
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

  // ═══════════════════════════════════════════════
  //  MINT TAB: Direct Mint with custom owners
  // ═══════════════════════════════════════════════
  const addOwnerRow    = () => setOwners(prev => [...prev, { address: '', amount: '' }]);
  const removeOwnerRow = (i) => setOwners(prev => prev.filter((_, idx) => idx !== i));
  const updateOwner    = (i, field, val) => setOwners(prev => prev.map((o, idx) => idx===i ? {...o,[field]:val} : o));

  const handleDirectMint = () => {
    setMintError(null);
    if (!nftName.trim())       return setMintError('NFT Name is required.');
    if (!nftDesc.trim())       return setMintError('Description is required.');

    const validOwners = owners.filter(o => o.address.trim() && o.amount.trim());
    if (validOwners.length === 0) return setMintError('Add at least one fractional owner with an address and amount.');

    const invalidAddr = validOwners.find(o => !o.address.trim().startsWith('0x') || o.address.trim().length !== 42);
    if (invalidAddr) return setMintError(`Invalid address: ${invalidAddr.address}`);

    const invalidAmt = validOwners.find(o => isNaN(parseInt(o.amount)) || parseInt(o.amount) <= 0);
    if (invalidAmt) return setMintError('All amounts must be positive integers.');

    flowMode.current = 'mint';
    resetMint();

    writeMint({
      address: CONTRACT_ADDRESS, abi: SOLAR_ABI,
      functionName: 'mint',
      args: [
        validOwners.map(o => o.address.trim()),
        validOwners.map(o => BigInt(parseInt(o.amount))),
        nftName.trim(),
        nftDesc.trim(),
      ],
      chainId: BSC_TESTNET_CHAIN,
    });
  };

  const resetMintTab = () => {
    setMintPhase('idle'); setMintError(null);
    setMintedHash(null); setMintedTokenId(null);
    setNftName(''); setNftDesc('');
    setOwners([{ address: '', amount: '' }]);
    flowMode.current = null; resetMint();
  };

  // ── Helpers ──
  const isBusy    = ['wallet','mining'].includes(txPhase);
  const isMinting_ = ['wallet','mining'].includes(mintPhase);
  const totalFractions = owners.reduce((s, o) => s + (parseInt(o.amount) || 0), 0);

  const queueLabel = () => {
    if (txPhase === 'wallet')  return 'Confirm mint() in Wallet…';
    if (txPhase === 'mining')  return 'Mining… Minting F-NFT on BSC';
    if (txPhase === 'success') return '✅ F-NFT Minted & Project Live!';
    if (txPhase === 'error')   return '❌ Transaction Failed';
    return 'Approve & Mint F-NFT';
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
      <Head><title>Admin Command Center | OmniAI</title></Head>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <h1 style={{ fontSize: '2.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
          <Settings size={38} color="var(--color-secondary)" />
          Admin <span className="gradient-text">Command Center</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem' }}>
          Review applications · Mint SolarRegistration F-NFTs · Deploy on BNB Chain
        </p>
      </div>

      {/* Auth Gates */}
      {!isConnected ? (
        <div className="glass" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '56px 24px' }}>
          <ShieldAlert size={56} style={{ opacity: 0.35, marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Admin Login Required</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '28px' }}>Connect the contract owner wallet.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}><ConnectButton /></div>
        </div>
      ) : !isAdmin ? (
        <div className="glass" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '56px 24px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle size={56} color="#ef4444" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
            <code style={{ color: 'var(--color-primary)' }}>{address?.slice(0,8)}…{address?.slice(-6)}</code> is not the contract owner.
          </p>
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
              { id:TABS.MINT,  label:'Mint F-NFT',    icon:<Sparkles size={15}/>, badge:null },
            ].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 22px', background:'none', border:'none', cursor:'pointer', fontSize:'0.9rem', borderBottom:activeTab===t.id?'2px solid var(--color-secondary)':'2px solid transparent', color:activeTab===t.id?'white':'var(--color-muted)', fontWeight:activeTab===t.id?'600':'400', marginBottom:'-1px', transition:'all 0.2s' }}>
                {t.icon}{t.label}
                {t.badge!=null && <span style={{ background:t.badge>0?'var(--color-primary)':'rgba(255,255,255,0.1)', color:'white', fontSize:'0.68rem', fontWeight:'700', padding:'2px 7px', borderRadius:'20px' }}>{t.badge}</span>}
              </button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'12px', paddingBottom:'12px' }}>
              <button onClick={()=>{fetchApplications();fetchStats();}}
                style={{ background:'none', border:'none', color:'var(--color-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem' }}>
                <RefreshCw size={13}/> Refresh
              </button>
              <ConnectButton />
            </div>
          </div>

          {/* ══ QUEUE TAB ══ */}
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

            {/* ══ MINT TAB ══ */}
            {activeTab === TABS.MINT && (
              <motion.div key="mint" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

                {mintPhase === 'success' ? (
                  /* SUCCESS */
                  <motion.div className="glass" initial={{ scale:0.95 }} animate={{ scale:1 }}
                    style={{ maxWidth:'640px', margin:'0 auto', padding:'48px 40px', textAlign:'center' }}>
                    <CheckCircle size={72} color="var(--color-secondary)" style={{ marginBottom:'20px' }} />
                    <h2 style={{ marginBottom:'10px' }}>F-NFT Minted! 🎉</h2>
                    <p style={{ color:'var(--color-muted)', lineHeight:'1.7', marginBottom:'28px' }}>
                      <strong style={{ color:'white' }}>{nftName}</strong> has been minted as a Fractional NFT
                      on BSC Testnet. Ownership is distributed across {owners.filter(o=>o.address&&o.amount).length} wallet(s).
                    </p>

                    {/* Tx receipt */}
                    {mintedHash && (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(44,194,149,0.06)', border:'1px solid rgba(44,194,149,0.2)', borderRadius:'10px', padding:'14px 18px', marginBottom:'20px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <Hash size={15} color="var(--color-secondary)"/>
                          <div style={{ textAlign:'left' }}>
                            <p style={{ fontSize:'0.72rem', color:'var(--color-muted)' }}>mint() transaction</p>
                            <code style={{ fontSize:'0.8rem' }}>{mintedHash.slice(0,26)}…</code>
                          </div>
                        </div>
                        <a href={`${BSC_EXPLORER}/tx/${mintedHash}`} target="_blank" rel="noreferrer" style={{ color:'var(--color-secondary)' }}>
                          <ExternalLink size={15}/>
                        </a>
                      </div>
                    )}

                    {/* Ownership table */}
                    <div style={{ textAlign:'left', marginBottom:'28px' }}>
                      <p style={{ fontSize:'0.78rem', color:'var(--color-muted)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Fractional Owners</p>
                      {owners.filter(o=>o.address&&o.amount).map((o,i)=>(
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', marginBottom:'6px', background:'rgba(255,255,255,0.03)', fontSize:'0.82rem' }}>
                          <code style={{ color:'var(--color-primary)' }}>{o.address.slice(0,12)}…{o.address.slice(-8)}</code>
                          <span style={{ color:'var(--color-secondary)', fontWeight:'600' }}>{parseInt(o.amount).toLocaleString()} fractions ({((parseInt(o.amount)/totalFractions)*100).toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-primary" style={{ width:'100%' }} onClick={resetMintTab}>
                      Mint Another F-NFT
                    </button>
                  </motion.div>

                ) : (
                  /* MINT FORM */
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'24px' }}>

                    {/* Left: Form */}
                    <div className="glass" style={{ padding:'36px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                        <div style={{ background:'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', borderRadius:'10px', padding:'10px', display:'flex' }}>
                          <Layers size={20} color="white"/>
                        </div>
                        <div>
                          <h2 style={{ fontSize:'1.3rem' }}>Mint Fractional NFT</h2>
                          <p style={{ fontSize:'0.8rem', color:'var(--color-muted)' }}>SolarRegistration.mint() — single transaction</p>
                        </div>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {mintError && (
                          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                            style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'12px 16px', marginBottom:'18px', display:'flex', gap:'8px', color:'#ef4444', fontSize:'0.85rem' }}>
                            <AlertTriangle size={15} style={{ flexShrink:0, marginTop:'2px' }}/>{mintError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

                        {/* NFT Name */}
                        <div>
                          <label style={{ display:'block', fontSize:'0.8rem', color:'var(--color-muted)', marginBottom:'7px', fontWeight:'500' }}>NFT Name <span style={{ color:'#ef4444' }}>*</span></label>
                          <input type="text" placeholder="e.g. AI Healthcare Platform" value={nftName} disabled={isMinting_}
                            onChange={e=>setNftName(e.target.value)}
                            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }}/>
                        </div>

                        {/* Description */}
                        <div>
                          <label style={{ display:'block', fontSize:'0.8rem', color:'var(--color-muted)', marginBottom:'7px', fontWeight:'500' }}>Description <span style={{ color:'#ef4444' }}>*</span></label>
                          <textarea placeholder="Describe the project, revenue model, and expected yield…" value={nftDesc} disabled={isMinting_} rows={3}
                            onChange={e=>setNftDesc(e.target.value)}
                            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'12px 16px', color:'white', fontSize:'0.9rem', outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
                        </div>

                        {/* Fractional Owners Table */}
                        <div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                            <label style={{ fontSize:'0.8rem', color:'var(--color-muted)', fontWeight:'500' }}>
                              Fractional Owners <span style={{ color:'#ef4444' }}>*</span>
                              <span style={{ marginLeft:'8px', fontSize:'0.72rem', color:'var(--color-muted)', fontWeight:'400' }}>
                                Total: {totalFractions.toLocaleString()} fractions
                              </span>
                            </label>
                            <button onClick={addOwnerRow} disabled={isMinting_}
                              style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(161,98,247,0.12)', border:'1px solid rgba(161,98,247,0.25)', borderRadius:'8px', padding:'5px 12px', color:'var(--color-primary)', cursor:'pointer', fontSize:'0.78rem', fontWeight:'600' }}>
                              <Plus size={13}/> Add Owner
                            </button>
                          </div>

                          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            {owners.map((o, i)=>(
                              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 140px 36px', gap:'8px', alignItems:'center' }}>
                                <input type="text" placeholder={`0x… wallet address`} value={o.address} disabled={isMinting_}
                                  onChange={e=>updateOwner(i,'address',e.target.value)}
                                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 14px', color:'white', fontSize:'0.82rem', fontFamily:'monospace', outline:'none', minWidth:0 }}/>
                                <div style={{ position:'relative' }}>
                                  <input type="number" placeholder="Fractions" value={o.amount} disabled={isMinting_} min={1}
                                    onChange={e=>updateOwner(i,'amount',e.target.value)}
                                    style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 14px', color:'white', fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }}/>
                                </div>
                                <button onClick={()=>removeOwnerRow(i)} disabled={isMinting_ || owners.length === 1}
                                  style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'8px', cursor:'pointer', color:'#ef4444', opacity: owners.length===1 ? 0.3 : 1 }}>
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Ownership breakdown bar */}
                          {totalFractions > 0 && owners.filter(o=>o.address&&o.amount).length > 0 && (
                            <div style={{ marginTop:'10px', borderRadius:'6px', overflow:'hidden', height:'6px', background:'rgba(255,255,255,0.06)', display:'flex' }}>
                              {owners.filter(o=>o.address&&o.amount).map((o,i)=>{
                                const pct = (parseInt(o.amount)||0)/totalFractions*100;
                                const colors=['var(--color-primary)','var(--color-secondary)','#f59e0b','#ec4899','#06b6d4'];
                                return <div key={i} style={{ width:`${pct}%`, background:colors[i%colors.length], transition:'width 0.3s' }}/>;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Contract address hint */}
                        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px 16px', fontSize:'0.8rem', color:'var(--color-muted)' }}>
                          <p style={{ marginBottom:'4px' }}>Contract: <code style={{ color:'var(--color-primary)', fontSize:'0.78rem' }}>{CONTRACT_ADDRESS}</code></p>
                          <p>ABI: <code style={{ color:'var(--color-secondary)' }}>SolarRegistration.mint(address[], uint256[], string, string)</code></p>
                        </div>

                        {/* Mint Button */}
                        <button id="mint-fnft-btn" onClick={handleDirectMint} disabled={isMinting_}
                          style={{ padding:'16px', fontSize:'1rem', fontWeight:'600', background: isMinting_ ? 'rgba(161,98,247,0.4)' : 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', border:'none', borderRadius:'12px', color:'white', cursor: isMinting_ ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                          {isMinting_
                            ? <><span style={{ width:'17px', height:'17px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }}/>{mintBtnLabel()}</>
                            : <><Sparkles size={17}/> Mint Fractional NFT</>}
                        </button>

                        {mintPhase === 'error' && (
                          <button onClick={resetMintTab}
                            style={{ padding:'10px', fontSize:'0.88rem', background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'var(--color-muted)', cursor:'pointer' }}>
                            ↩ Reset & Try Again
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Info Panel */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

                      {/* Contract flow */}
                      <div className="glass" style={{ padding:'22px' }}>
                        <p style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginBottom:'18px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Contract Flow</p>
                        {[
                          { icon:'1', label:'mint(owners[], amounts[], name, desc)', sub:'Single transaction — one wallet confirm', active: isMinting_, done: mintPhase==='success' },
                          { icon:'✓', label: 'TokenMinted event emitted', sub:'Visible on BscScan', active:false, done: mintPhase==='success' },
                          { icon:'✓', label: 'Fractions assigned to wallets', sub:'Queryable via getDetailedFractionOwnership()', active:false, done: mintPhase==='success' },
                        ].map((s,i)=>(
                          <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'14px' }}>
                            <div style={{ width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.75rem', fontWeight:'700',
                              background: s.done ? 'rgba(44,194,149,0.15)' : s.active ? 'rgba(161,98,247,0.15)' : 'rgba(255,255,255,0.04)',
                              border:`2px solid ${s.done ? 'var(--color-secondary)' : s.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                              color: s.done ? 'var(--color-secondary)' : s.active ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                              {s.active ? <Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> : s.icon}
                            </div>
                            <div>
                              <p style={{ fontSize:'0.82rem', fontWeight:'600', color: s.done?'var(--color-secondary)':s.active?'white':'var(--color-muted)' }}>{s.label}</p>
                              <p style={{ fontSize:'0.72rem', color:'var(--color-muted)' }}>{s.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Preview Card */}
                      {(nftName || totalFractions > 0) && (
                        <motion.div className="glass" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                          style={{ padding:'20px', border:'1px solid rgba(161,98,247,0.15)' }}>
                          <p style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Preview</p>
                          <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'14px' }}>
                            <div style={{ width:'38px', height:'38px', background:'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Sparkles size={16} color="white"/>
                            </div>
                            <div>
                              <p style={{ fontWeight:'700' }}>{nftName||'—'}</p>
                              <p style={{ fontSize:'0.73rem', color:'var(--color-muted)' }}>ERC-721 · SolarRegistration · BSC</p>
                            </div>
                          </div>
                          {[
                            ['Total Fractions', totalFractions.toLocaleString()],
                            ['Owners',          `${owners.filter(o=>o.address&&o.amount).length} wallet(s)`],
                            ['Contract',        `${CONTRACT_ADDRESS.slice(0,10)}…`],
                          ].map(([k,v])=>(
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderTop:'1px solid rgba(255,255,255,0.05)', fontSize:'0.82rem' }}>
                              <span style={{ color:'var(--color-muted)' }}>{k}</span>
                              <span style={{ fontWeight:'500' }}>{v}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* BscScan link */}
                      <a href={`${BSC_EXPLORER}/address/${CONTRACT_ADDRESS}#readContract`} target="_blank" rel="noreferrer"
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'12px', color:'var(--color-muted)', textDecoration:'none', fontSize:'0.82rem' }}>
                        <ExternalLink size={13}/> View Contract on BscScan
                      </a>
                    </div>
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

                  {/* What mint() will do */}
                  <div style={{ background:'rgba(44,194,149,0.05)', border:'1px solid rgba(44,194,149,0.15)', borderRadius:'10px', padding:'14px 18px', fontSize:'0.83rem' }}>
                    <p style={{ color:'var(--color-secondary)', fontWeight:'600', marginBottom:'8px' }}>What Approve &amp; Mint will do:</p>
                    <p style={{ color:'var(--color-muted)', lineHeight:'1.6' }}>
                      Calls <code style={{ color:'white' }}>SolarRegistration.mint()</code> with:<br/>
                      • Owner: <code style={{ color:'var(--color-primary)', fontSize:'0.75rem' }}>{selectedApp.startupWallet?.slice(0,14)}…</code><br/>
                      • Amount: <strong style={{ color:'white' }}>{selectedApp.tokenSupply?.toLocaleString()} fractions</strong> (100% to startup)<br/>
                      • Name: <strong style={{ color:'white' }}>{selectedApp.name}</strong>
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
                    : txPhase==='success'?'✅ Minted & Live!'
                    : <><Sparkles size={15}/> Approve &amp; Mint F-NFT</>}
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
