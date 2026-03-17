import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Rocket, ShieldCheck, TrendingUp, Cpu, Zap, Globe, 
  ArrowRight, LayoutGrid, Settings, PieChart, FileText, 
  Layers, Lock, Share2, BarChart3, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <>
      <Head>
        <title>AiCapX | Institutional AI Infrastructure Tokenization</title>
        <meta name="description" content="AiCapX democratizes access to institutional-grade AI compute through RWA tokenization. Bridge the gap between GPU clusters and DeFi liquidity." />
      </Head>
      
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorations */}
        <div className="mesh-bg">
          <div className="mesh-blob" style={{ width: '600px', height: '600px', top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent 70%)' }} />
          <div className="mesh-blob" style={{ width: '800px', height: '800px', bottom: '0', right: '-20%', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent 70%)' }} />
        </div>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: -1, opacity: 0.4 }} />

        <div className="container" style={{ paddingTop: '140px' }}>
          {/* --- Hero Section --- */}
          {/* --- Hero Section --- */}
          <section style={{ padding: '40px 0 100px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '40px', 
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}>
              {/* Left Column: Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ flex: '1 1 400px', maxWidth: '650px' }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: '24px' }}
                >
                  <span style={{ 
                    background: 'rgba(251, 191, 36, 0.08)', 
                    color: 'var(--color-accent)', 
                    padding: '8px 20px', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    <Zap size={13} fill="currentColor" />
                    The Next trillion-dollar asset class
                  </span>
                </motion.div>
                
                <h1 style={{ 
                  fontSize: 'clamp(2rem, 4.5vw, 4rem)', 
                  fontWeight: '900', 
                  marginBottom: '24px',
                  background: 'linear-gradient(to bottom, var(--color-text) 60%, rgba(2, 6, 23, 0.7))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'left',
                  lineHeight: '1.05'
                }}>
                  The Global Liquidity Layer for <span className="gradient-text">AI Infrastructure</span>
                </h1>
                
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: 'var(--color-muted)', 
                  marginBottom: '40px',
                  lineHeight: '1.6',
                  fontWeight: '400',
                  textAlign: 'left'
                }}>
                  AiCapX tokenizes high-performance GPU clusters into high-yield Real World Assets. 
                  Secure your stake in the global compute network that powers the future of intelligence.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                  <Link href="/market">
                    <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '100px' }}>
                      Access Marketplace <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                    </button>
                  </Link>
                  <Link href="/startups">
                    <button className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '100px' }}>
                      Launch My Cluster
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Dashboard Preview Mockup */}
              <motion.div 
                initial={{ opacity: 0, x: 40, rotateY: -15, rotateX: 6, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, rotateY: -8, rotateX: 3, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05, transition: { duration: 0.4 } }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="glass"
                style={{ 
                  flex: '1 1 400px',
                  minWidth: '400px',
                  height: '480px', 
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: 'white',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                  margin: '20px 0'
                }}
              >
                {/* Browser Header */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                  </div>
                  <div style={{ height: '24px', flex: 1, background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '9px', color: '#94a3b8' }}>
                    https://app.aicapx.io/market/gpu-h100-cluster-delta
                  </div>
                </div>

                {/* Sidebar + Main Content Mockup */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Mini Sidebar */}
                  <div style={{ width: '60px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', padding: '20px 0', gap: '20px', alignItems: 'center', color: '#94a3b8' }}>
                    <LayoutGrid size={18} />
                    <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
                    <Settings size={18} />
                    <PieChart size={18} />
                  </div>

                  {/* Main Mockup Area */}
                  <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                    {/* Left Column: Chart and List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Fake Chart */}
                      <div style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', height: '140px', background: 'linear-gradient(to bottom right, #ffffff, #fafafa)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div>
                            <p style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yield Performance</p>
                            <h4 style={{ fontSize: '1rem' }}>$1,420.65 <span style={{ color: '#10b981', fontSize: '9px', fontWeight: '700' }}>+12.4%</span></h4>
                          </div>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {[1,2,3,4,5].map(i => <div key={i} style={{ width: '14px', height: '6px', background: i === 3 ? 'var(--color-primary)' : '#f1f5f9', borderRadius: '2px' }} />)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '40px', gap: '4px' }}>
                          {[40, 60, 45, 70, 55, 80, 95, 75, 85, 90, 100, 80, 70, 85, 90].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--color-primary)', opacity: 0.1 + (i * 0.05), borderRadius: '1px 1px 0 0' }} />
                          ))}
                        </div>
                      </div>

                      {/* Cluster List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { name: 'NVIDIA H100 Cluster Alpha', status: 'Active' },
                          { name: 'A100 Enterprise Node', status: 'Locked' }
                        ].map((item, i) => (
                          <div key={i} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={12} /></div>
                              <span style={{ fontSize: '10px', fontWeight: '600' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize: '8px', color: '#10b981', padding: '3px 6px', background: '#ecfdf5', borderRadius: '100px', fontWeight: '700' }}>{item.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Portfolio */}
                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '2px' }}>Portfolio Balance</p>
                        <h3 style={{ fontSize: '1.4rem' }}>14.25 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>BNB</span></h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Recent Distributions</p>
                        {[
                          { label: 'Yield', val: '+0.12' },
                          { label: 'Fee', val: '+0.05' },
                          { label: 'Bonus', val: '+0.08' }
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                              <span style={{ fontSize: '9px', fontWeight: '500', color: 'var(--color-text)' }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: '700', color: '#10b981' }}>{item.val}</span>
                          </div>
                        ))}
                      </div>

                      <button style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'var(--color-text)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* --- Stats Cards --- */}
          <motion.section 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '24px', 
              marginBottom: '140px',
              paddingTop: '60px'
            }}
          >
            {[
              { label: 'Network Total Locked', value: '$24.8M+', icon: <Layers size={20} /> },
              { label: 'Compute Clusters', value: '150+', icon: <Cpu size={20} /> },
              { label: 'Ecosystem Partners', value: '12,000+', icon: <Globe size={20} /> },
              { label: 'Avg Pillar APY', value: '18.5%', icon: <BarChart3 size={20} /> },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="glass" style={{ padding: '40px 32px', textAlign: 'left', position: 'relative' }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '24px', opacity: 0.8 }}>{stat.icon}</div>
                <h3 style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--color-text)', marginBottom: '8px' }}>{stat.value}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* --- Why AiCapX Section --- */}
          <section style={{ marginBottom: '160px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                <h2 style={{ fontSize: '3.2rem', marginBottom: '32px' }}>A Unified Standard for <span className="gradient-text">AI Real-World Assets</span></h2>
                <p style={{ fontSize: '1.15rem', color: 'var(--color-muted)', lineHeight: '1.7', marginBottom: '40px' }}>
                  Traditional AI funding is siloed and inaccessible. AiCapX leverages fractional NFT (F-NFT) standards to bring physical compute assets on-chain, creating a transparent, liquid, and automated treasury for AI founders.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { title: 'Institutional Verification', desc: 'Every compute cluster is vetted by our protocol before minting.', icon: <ShieldCheck size={22} /> },
                    { title: 'Liquidity on Demand', desc: 'Exit positions instantly through our AMM-enabled secondary market.', icon: <Share2 size={22} /> },
                    { title: 'Autonomous Yields', desc: 'Revenue streams flow directly from compute usage to your wallet.', icon: <TrendingUp size={22} /> }
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{p.title}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8 }} 
                viewport={{ once: true }}
                className="hero-glow"
              >
                <div className="glass" style={{ padding: '60px', background: 'linear-gradient(135deg, white, #f1f5f9)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--color-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      <Lock size={36} />
                    </div>
                    <h3>Secure RWA Tokenization</h3>
                    <p style={{ color: 'var(--color-muted)' }}>ERC-1155 Fractional Standard</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 0.8, 0.6].map((op, i) => (
                      <div key={i} style={{ height: '14px', borderRadius: '100px', background: 'var(--color-primary)', width: `${90 - (i * 15)}%`, opacity: op }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* --- Core Modules --- */}
          <section style={{ paddingBottom: '160px' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <span className="gradient-text" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: '800' }}>The Protocol Stack</span>
              <h2 style={{ fontSize: '3.5rem', marginTop: '16px' }}>Everything You Need to <br/>Scale the <span style={{ fontWeight: 400, fontStyle: 'italic' }}>Next SOTA Model</span></h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {[
                { 
                  icon: <LayoutGrid size={30} />, 
                  title: 'AI Asset Marketplace', 
                  desc: 'A high-liquidity venue for trading institutional AI infrastructure fractions.',
                  tag: 'Trade'
                },
                { 
                  icon: <Settings size={30} />, 
                  title: 'Governance Hub', 
                  desc: 'Decentralized oversight for asset verification and protocol parameter management.',
                  tag: 'Govern'
                },
                { 
                  icon: <Rocket size={30} />, 
                  title: 'Founder Forge', 
                  desc: 'Specialized tooling for AI startups to tokenize compute and manage equity.',
                  tag: 'Launch'
                },
                { 
                  icon: <PieChart size={30} />, 
                  title: 'Investor Analytics', 
                  desc: 'Professional-grade portfolio tracking and yield performance dashboard.',
                  tag: 'Analyze'
                },
                { 
                  icon: <FileText size={30} />, 
                  title: 'Compute Registry', 
                  desc: 'Immutable, on-chain registry of all verified high-performance clusters.',
                  tag: 'Audit'
                },
                { 
                  icon: <TrendingUp size={30} />, 
                  title: 'Auto-Yield Engine', 
                  desc: 'Smart contract-based distribution of real-time AI inference revenue.',
                  tag: 'Earn'
                }
              ].map((feat, i) => (
                <motion.div 
                  key={i} 
                  className="glass" 
                  style={{ padding: '52px 44px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  whileHover={{ y: -8, borderColor: 'var(--color-primary)', background: '#ffffff', boxShadow: '0 20px 40px rgba(251, 191, 36, 0.12)' }}
                >
                  <div style={{ color: 'var(--color-primary)', marginBottom: '32px' }}>{feat.icon}</div>
                  <h4 style={{ fontSize: '1.4rem', marginBottom: '16px', fontWeight: '800' }}>{feat.title}</h4>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>{feat.desc}</p>
                  
                  <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Learn More <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* --- Final CTA --- */}
          <section style={{ paddingBottom: '140px' }}>
            <div className="glass" style={{ 
              padding: '100px 60px', 
              textAlign: 'center', 
              background: 'linear-gradient(165deg, var(--color-text), #1e293b)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '48px'
            }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <h2 style={{ fontSize: '3.8rem', marginBottom: '24px', color: 'white' }}>Own the Infrastructure <br/>of <span className="gradient-text">Tomorrow</span></h2>
                <p style={{ opacity: 0.7, fontSize: '1.25rem', marginBottom: '56px', maxWidth: '650px', margin: '0 auto 56px' }}>
                  The AI revolution is happening now. Secure your stake in the global compute layer and participate in the growth of autonomous intelligence.
                </p>
                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                  <button className="btn btn-primary" style={{ padding: '20px 60px', fontSize: '1.2rem', borderRadius: '100px' }}>
                    Get Started Now
                  </button>
                </div>
              </motion.div>

              {/* Decorative Gradients for CTA */}
              <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--color-primary)', opacity: 0.2, filter: 'blur(100px)' }} />
              <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--color-accent)', opacity: 0.2, filter: 'blur(100px)' }} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}