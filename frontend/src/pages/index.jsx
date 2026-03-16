import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Rocket, ShieldCheck, TrendingUp, Cpu, Zap, Globe, ArrowRight, LayoutGrid, Settings, PieChart, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Head>
        <title>AiCapX | The Future of AI Infrastructure Funding</title>
        <meta name="description" content="Democratizing AI infrastructure funding through Real-World Asset (RWA) tokenization and DeFi. Invest in the future of AI." />
      </Head>
      
      <div className="container" style={{ paddingTop: '80px' }}>
        {/* --- Hero Section --- */}
        <section style={{ textAlign: 'center', padding: '100px 0 60px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <span style={{ 
              background: 'rgba(161, 98, 247, 0.1)', 
              color: 'var(--color-primary)', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: '600',
              border: '1px solid rgba(161, 98, 247, 0.2)',
              marginBottom: '24px',
              display: 'inline-block'
            }}>
              <Zap size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Revolutionizing AI RWA Tokenization
            </span>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: '800', 
              lineHeight: '1.1',
              marginBottom: '24px',
              maxWidth: '900px',
              margin: '0 auto 24px'
            }}>
              Empower the Next Generation of <span className="gradient-text">AI Excellence</span>
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--color-muted)', 
              marginBottom: '40px',
              maxWidth: '650px',
              margin: '0 auto 40px',
              lineHeight: '1.6'
            }}>
              The premier platform for tokenizing AI infrastructure. Bridge the gap between 
              Institutional-grade GPU clusters and global DeFi liquidity.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/market">
                <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                  Start Investing <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </Link>
              <Link href="/startups">
                <button className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                  Launch Your Model
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* --- Stats Cards --- */}
        <motion.section 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px', 
            marginBottom: '100px'
          }}
        >
          {[
            { label: 'Total Volume Locked', value: '$24.8M+', color: 'var(--color-primary)' },
            { label: 'Active GPU Clusters', value: '150+', color: 'var(--color-secondary)' },
            { label: 'Global Scale Investors', value: '12,000+', color: 'var(--color-primary)' },
            { label: 'Platform APY', value: '18.5%', color: 'var(--color-secondary)' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="glass" style={{ padding: '30px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '700', color: stat.color }}>{stat.value}</h3>
            </motion.div>
          ))}
        </motion.section>

        {/* --- Features Grid --- */}
        <section style={{ paddingBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Engineered for <span className="gradient-text">Trust & Scale</span></h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>Building the foundations for autonomous AI economies through secure on-chain protocols.</p>
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
                desc: 'Browse and invest in institutional-grade AI projects through fractional NFT ownership.',
                details: ['Real-time Orderbook', 'Project Analytics', 'Instant Buy/Sell'],
                tag: 'Trading'
              },
              { 
                icon: <Settings size={30} />, 
                title: 'Admin Command Center', 
                desc: 'A dedicated dashboard for platform governing to verify models and mint verified F-NFTs.',
                details: ['Proposal Queue', 'Verification Tools', 'Contract Controls'],
                tag: 'Operations'
              },
              { 
                icon: <Rocket size={30} />, 
                title: 'Founder Launchpad', 
                desc: 'An end-to-end portal for AI startups to submit proposals and tokenize their future revenue.',
                details: ['Draft Submissions', 'Resource Planning', 'Funding Tracking'],
                tag: 'Startups'
              },
              { 
                icon: <PieChart size={30} />, 
                title: 'Investor Portfolio', 
                desc: 'Monitor your fractional shares, track accumulated yields, and manage your AI asset collection.',
                details: ['Asset Overview', 'Yield History', 'Performance Charts'],
                tag: 'Portfolio'
              },
              { 
                icon: <FileText size={30} />, 
                title: 'AutoAgent Registry', 
                desc: 'The official on-chain registry where every AI model is minted as a unique, verifiable asset.',
                details: ['Immutable Data', 'Creator Identity', 'IP Verification'],
                tag: 'Inventory'
              },
              { 
                icon: <ShieldCheck size={30} />, 
                title: 'Automated Yield Engine', 
                desc: 'A smart contract-driven system that distributes AI model revenue directly to token holders.',
                details: ['Oracle Integration', 'Real-time Claims', 'Zero-Fee Streams'],
                tag: 'Payments'
              }
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                className="glass" 
                style={{ padding: '40px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ y: -10, borderColor: 'var(--color-primary)', background: 'rgba(255,255,255,0.03)' }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  background: 'rgba(161, 98, 247, 0.08)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  marginBottom: '28px',
                  boxShadow: '0 0 20px rgba(161, 98, 247, 0.1)'
                }}>
                  {feat.icon}
                </div>
                <h4 style={{ fontSize: '1.4rem', marginBottom: '16px', fontWeight: '700' }}>{feat.title}</h4>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>{feat.desc}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {feat.details.map((detail, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'white', opacity: 0.8 }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-secondary)' }} />
                      {detail}
                    </div>
                  ))}
                </div>

                <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '0.65rem', opacity: 0.4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {feat.tag}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section style={{ paddingBottom: '100px' }}>
          <div className="glass" style={{ 
            padding: '80px 40px', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, rgba(161, 98, 247, 0.1), rgba(44, 194, 149, 0.05))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontSize: '2.8rem', marginBottom: '20px' }}>Join the World's First <br/><span className="gradient-text">AI Compute Marketplace</span></h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Thousands of visionaries are already building the future. Secure your stake in the next trillion-dollar infrastructure layer.
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button className="btn btn-primary" style={{ padding: '16px 48px' }}>Create Your Account</button>
              </div>
              <p style={{ marginTop: '32px', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                Trusted by enterprise innovators and over 50+ AI protocol founders.
              </p>
            </motion.div>

            {/* Decorative Orbs */}
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-primary)', opacity: 0.1, filter: 'blur(100px)' }} />
            <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--color-secondary)', opacity: 0.1, filter: 'blur(100px)' }} />
          </div>
        </section>
      </div>
    </>
  );
}