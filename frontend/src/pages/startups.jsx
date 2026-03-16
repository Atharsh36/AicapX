import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Rocket, ShieldHalf, LayoutGrid, FileText } from 'lucide-react';
import styles from '../styles/Startups.module.css';

export default function Startups() {
  const steps = [
    { 
      icon: <FileText size={20} />, 
      title: "1. Comprehensive Proposal", 
      desc: "Specify your AI model architecture, training dataset requirements, and GPU compute needs. Define clear revenue streams (API fees, white-labeling, or tokens) and set your funding target for the development cycle.",
      bullets: ["Model Architecture", "Revenue Roadmap", "GPU Resource Plan"]
    },
    { 
      icon: <LayoutGrid size={20} />, 
      title: "2. Fractional Tokenization", 
      desc: "Following technical audit and KYC, we tokenize your project's future productivity. We mint Real World Asset (RWA) fractions on the BNB Chain that represent legally binding ownership of the project's generated revenue.",
      bullets: ["AI Audit Verification", "Smart Contract Issuance", "Legal Wrapper Integration"]
    },
    { 
      icon: <Rocket size={20} />, 
      title: "3. Raise & Milestone Build", 
      desc: "Engage with a global pool of AI-focused investors. Capital is secured in transparent escrows and released via 'Proof of Milestone' (e.g., successful fine-tuning or model deployment) to ensure accountability.",
      bullets: ["Global TVL Participation", "Escrow-Protected Capital", "Milestone-Based Scaling"]
    },
    { 
      icon: <ShieldHalf size={20} />, 
      title: "4. Autonomous Yield Engine", 
      desc: "Connect your production environment to our Revenue Oracles. As your system earns from inference or sales, the platform automatically streamlines yields back to your NFT holders in real-time via smart contracts.",
      bullets: ["Oracle-Verified Income", "Instant NFT Settlements", "Transparent Dashboard Tracking"]
    }
  ];

  const applicationStages = [
    { title: "Technical Screening", detail: "Our engineering team reviews your model architecture, GPU requirements, and dataset feasibility." },
    { title: "Legal & Compliance", detail: "Verification of entity registration, IP ownership, and jurisdictional compliance for token issuance." },
    { title: "Smart Contract Audit", detail: "Automated and manual audits of the project's specific revenue distribution logic." },
    { title: "Marketplace Listing", detail: "Once approved, your F-NFTs go live for global subscription with a dedicated launch countdown." }
  ];

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Head>
        <title>For Startups | AiCapX</title>
      </Head>

      <div className={styles.header}>
        <h1>Tokenize Your <span className="gradient-text">AI Vision</span></h1>
        <p>Bypass traditional VCs. Raise capital for your GPU clusters and development directly from a global pool of Web3 investors.</p>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <h2>How it Works</h2>
          <ul className={styles.stepList}>
            {steps.map((step, idx) => (
              <motion.li key={idx} className={styles.stepItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} style={{ marginBottom: '32px', listStyle: 'none' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.stepIcon} style={{ flexShrink: 0 }}>{step.icon}</div>
                  <div className={styles.stepContent}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{step.title}</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-muted)', marginBottom: '12px' }}>{step.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {step.bullets.map((b, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-secondary)' }}>
                           {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div 
            className={`glass ${styles.formContainer}`}
            style={{ padding: '32px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 style={{ marginBottom: '24px', fontSize: '1.6rem' }}>Draft Your Proposal</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input type="text" className={styles.formControl} placeholder="e.g. Nexus Foundation Model V2" readOnly style={{ cursor: 'not-allowed', opacity: 0.7, pointerEvents: 'none', boxShadow: 'none', outline: 'none' }} />
              </div>
              
              <div className={styles.formGroup}>
                <label>AI Category</label>
                <select className={styles.formControl} defaultValue="" disabled style={{ cursor: 'not-allowed', opacity: 0.7, pointerEvents: 'none', boxShadow: 'none', outline: 'none' }}>
                  <option value="" disabled>Select Category</option>
                  <option value="llm">Large Language Model (LLM)</option>
                  <option value="vision">Computer Vision</option>
                  <option value="voice">Audio / Speech</option>
                  <option value="healthcare">Healthcare AI</option>
                  <option value="depin">DePIN Compute</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Funding Goal (USDT)</label>
                <input type="number" className={styles.formControl} placeholder="500,000" readOnly style={{ cursor: 'not-allowed', opacity: 0.7, pointerEvents: 'none', boxShadow: 'none', outline: 'none' }} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Project Description & Use of Funds</label>
                <textarea 
                  className={styles.formControl} 
                  placeholder="Describe your model architecture, dataset licensing needs, and exact GPU requirements..."
                  style={{ minHeight: '140px', cursor: 'not-allowed', opacity: 0.7, pointerEvents: 'none', boxShadow: 'none', outline: 'none' }}
                  readOnly
                ></textarea>
              </div>
              
              <button className={`btn btn-primary ${styles.submitBtn}`} onClick={() => window.location.href = '/apply'}>
                Start Application Process
              </button>
            </form>
          </motion.div>

          <div className="glass" style={{ padding: '24px', borderRadius: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Looking for GPU grants? <br/>
              <span style={{ color: 'white', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>Apply for Compute Credits</span>
            </p>
          </div>
        </div>

        {/* Full-width Verification Box */}
        <div style={{ gridColumn: '1 / -1', marginTop: '40px', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <ShieldHalf size={20}/> Detailed Verification Process
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {applicationStages.map((stage, i) => (
              <div key={i}>
                <p style={{ color: 'white', fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>0{i+1}. {stage.title}</p>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>{stage.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}