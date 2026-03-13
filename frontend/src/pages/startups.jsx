import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Rocket, ShieldHalf, LayoutGrid, FileText } from 'lucide-react';
import styles from '../styles/Startups.module.css';

export default function Startups() {
  const steps = [
    {
      icon: <FileText size={24} />,
      title: "1. Submit Proposal",
      desc: "Detail your AI model, dataset requirements, expected revenue streams, and funding goal."
    },
    {
      icon: <LayoutGrid size={24} />,
      title: "2. Tokenization",
      desc: "Once verified, we mint RWA tokens representing fractional ownership of your project's future revenue."
    },
    {
      icon: <Rocket size={24} />,
      title: "3. Raise & Build",
      desc: "Global investors fund your project. Capital is unlocked in milestones via our secure escrow."
    },
    {
      icon: <ShieldHalf size={24} />,
      title: "4. Autonomous Distribution",
      desc: "Bridge your off-chain AI revenue through our Oracles to automatically distribute yields to holders."
    }
  ];

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Head>
        <title>For Startups | OmniAI</title>
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
              <motion.li 
                key={idx} 
                className={styles.stepItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div 
          className={`glass ${styles.formContainer}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 style={{ marginBottom: '24px' }}>Draft Your Proposal</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label>Project Name</label>
              <input type="text" className={styles.formControl} placeholder="e.g. Nexus Foundation Model V2" />
            </div>
            
            <div className={styles.formGroup}>
              <label>AI Category</label>
              <select className={styles.formControl} defaultValue="">
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
              <input type="number" className={styles.formControl} placeholder="500,000" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Project Description & Use of Funds</label>
              <textarea 
                className={styles.formControl} 
                placeholder="Describe your model architecture, dataset licensing needs, and exact GPU requirements..."
              ></textarea>
            </div>
            
            <button className={`btn btn-primary ${styles.submitBtn}`} onClick={() => window.location.href = '/apply'}>
              Start Application Process
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}