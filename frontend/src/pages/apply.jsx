import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Cpu, 
  DollarSign, 
  Activity, 
  Video, 
  Map, 
  Briefcase, 
  Mail, 
  CheckSquare,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock
} from 'lucide-react';
import styles from '../styles/StartupSubmission.module.css';

const steps = [
  { id: 1, title: 'Company Verif.', icon: <Building2 size={18} /> },
  { id: 2, title: 'Project Info', icon: <Cpu size={18} /> },
  { id: 3, title: 'Funding Details', icon: <DollarSign size={18} /> },
  { id: 4, title: 'Product Status', icon: <Activity size={18} /> },
  { id: 5, title: 'Technical Proof', icon: <Video size={18} /> },
  { id: 6, title: 'Milestones', icon: <Map size={18} /> },
  { id: 7, title: 'Revenue Model', icon: <Briefcase size={18} /> },
  { id: 8, title: 'Contact / Socials', icon: <Mail size={18} /> },
  { id: 9, title: 'Legal & Terms', icon: <CheckSquare size={18} /> },
];

export default function StartupSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState('draft'); // draft, review, approved

  const [formData, setFormData] = useState({
    founderName: '',
    email: '',
    companyName: '',
    projectName: '',
    startupName: '',
    category: '',
    desc: '',
    goal: '',
    tokenSupply: '',
    apy: '15-20%',
    demoVideo: '',
    revenueProof: 'Stripe_Export_Q1.pdf',
    userCount: '',
    documents: ['Incorporation_Cert.pdf'],
    startupWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // Hardhat Account #1
  });

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.projectName,
          startupName: formData.companyName,
          category: formData.category,
          desc: formData.desc,
          goal: formData.goal,
          tokenSupply: formData.tokenSupply,
          apy: formData.apy,
          founderName: formData.founderName,
          startupWallet: formData.startupWallet,
          demoVideo: formData.demoVideo,
          revenueProof: formData.revenueProof,
          userCount: formData.userCount,
          documents: formData.documents
        })
      });
      if (res.ok) {
         setSubmissionStatus('review');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server.");
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Founder & Company Verification</h2>
              <p>Official company information is required to ensure trust and compliance.</p>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Founder Full Name</label>
                <input type="text" className={styles.formControl} placeholder="John Doe" />
              </div>
              <div className={styles.formGroup}>
                <label>Founder Email</label>
                <input type="email" className={styles.formControl} placeholder="founder@ai-startup.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input type="tel" className={styles.formControl} placeholder="+1 234 567 890" />
              </div>
              <div className={styles.formGroup}>
                <label>LinkedIn Profile</label>
                <input type="url" className={styles.formControl} placeholder="linkedin.com/in/johndoe" />
              </div>
              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" className={styles.formControl} placeholder="Nexus AI Ltd." />
              </div>
              <div className={styles.formGroup}>
                <label>Company Website</label>
                <input type="url" className={styles.formControl} placeholder="https://nexus-ai.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Country of Registration</label>
                <select className={styles.formControl}>
                  <option value="">Select Country</option>
                  <option value="us">United States</option>
                  <option value="sg">Singapore</option>
                  <option value="ae">UAE</option>
                  <option value="ch">Switzerland</option>
                  <option value="uk">United Kingdom</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Registration Number</label>
                <input type="text" className={styles.formControl} placeholder="Business Registration No." />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '24px' }}>
              <label>KYB Documents (Upload Cert of Incorporation, Govt ID, Registration)</label>
              <div className={styles.uploadArea}>
                <Upload size={32} className={styles.uploadIcon} />
                <p>Drag & drop PDF files here, or click to browse</p>
                <span className={styles.uploadHint}>Max size: 10MB per file</span>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Project Information</h2>
              <p>Detail your AI architecture, data sources, and problem statement.</p>
            </div>
            
            <div className={styles.formGroup}>
              <label>Project Name</label>
              <input type="text" className={styles.formControl} placeholder="Nexus Foundation Model V2" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <label>AI Category</label>
              <select className={styles.formControl} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="">Select Category</option>
                <option value="LLMs">Generative AI</option>
                <option value="Healthcare">Healthcare AI</option>
                <option value="Finance">Financial AI</option>
                <option value="Autonomous Agents">Autonomous Agents</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="DePIN">DePIN Compute</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Short Project Summary (max 150 chars)</label>
              <input type="text" className={styles.formControl} placeholder="Optimizing context window size up to 1M tokens for enterprise data processing." />
            </div>

            <div className={styles.formGroup}>
              <label>Detailed Project Description</label>
              <textarea 
                className={styles.formControl} 
                placeholder="Include your problem statement, AI model architecture, dataset sources, infrastructure requirements, and expected impact..."
                style={{ minHeight: '200px' }}
                value={formData.desc} 
                onChange={(e) => setFormData({...formData, desc: e.target.value})}
              />
            </div>
          </motion.div>
        );

      case 3: {
        // Auto-calculate token supply: 1 F-NFT = $20 of funding goal by default
        const TOKEN_PRICE_USD = 20;
        const goalNum = parseFloat(formData.goal) || 0;
        const supplyNum = parseInt(formData.tokenSupply) || 0;
        const tokenPriceActual = supplyNum > 0 ? (goalNum / supplyNum).toFixed(2) : TOKEN_PRICE_USD;
        const onePercentCost = supplyNum > 0 ? ((goalNum / supplyNum) * (supplyNum * 0.01)).toFixed(2) : '0';

        const handleGoalChange = (e) => {
          const newGoal = e.target.value;
          const autoSupply = newGoal ? Math.round(parseFloat(newGoal) / TOKEN_PRICE_USD) : '';
          setFormData({ ...formData, goal: newGoal, tokenSupply: autoSupply.toString() });
        };

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Funding & Token Allocation</h2>
              <p>Define your funding goal and how tokens represent ownership.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Funding Goal (Virtual USD)</label>
                <input
                  type="number"
                  className={styles.formControl}
                  placeholder="200000"
                  value={formData.goal}
                  onChange={handleGoalChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Total Token Supply (F-NFTs)
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary)', marginLeft: '8px', fontWeight: '400' }}>
                    ✦ Auto-calculated
                  </span>
                </label>
                <input
                  type="number"
                  className={styles.formControl}
                  placeholder="10000"
                  value={formData.tokenSupply}
                  onChange={(e) => setFormData({ ...formData, tokenSupply: e.target.value })}
                  style={{ borderColor: formData.goal ? 'var(--color-secondary)' : undefined }}
                />
              </div>
            </div>

            {/* Live F-NFT Preview Card */}
            {goalNum > 0 && supplyNum > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(44,194,149,0.08), rgba(161,98,247,0.08))',
                  border: '1px solid rgba(44,194,149,0.25)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '4px' }}>Price per F-NFT</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-secondary)' }}>
                    ${tokenPriceActual}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>USD per token</p>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '4px' }}>Total F-NFTs Minted</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'white' }}>
                    {supplyNum.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>ERC-1155 tokens</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '4px' }}>Cost for 1% Ownership</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                    ${parseFloat(onePercentCost).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>= {Math.round(supplyNum * 0.01)} tokens</p>
                </div>
              </motion.div>
            )}

            <h3 style={{ margin: '24px 0 12px 0', fontSize: '1.2rem' }}>Token Allocation (%)</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Investors</label>
                <input type="number" className={styles.formControl} placeholder="70" />
              </div>
              <div className={styles.formGroup}>
                <label>Founders & Team</label>
                <input type="number" className={styles.formControl} placeholder="20" />
              </div>
              <div className={styles.formGroup}>
                <label>Platform Treasury/Fee</label>
                <input type="number" className={styles.formControl} value="10" disabled />
              </div>
            </div>

            <h3 style={{ margin: '24px 0 12px 0', fontSize: '1.2rem' }}>Use of Funds Breakdown</h3>
            <div className={styles.listContainer}>
              <div className={styles.listItem}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Category</label>
                  <input type="text" className={styles.formControl} defaultValue="GPU Infrastructure Cost" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Amount (USDT)</label>
                  <input type="number" className={styles.formControl} placeholder="250,000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Percentage</label>
                  <input type="number" className={styles.formControl} placeholder="50" />
                </div>
              </div>
              <div className={styles.listItem}>
                <div>
                  <input type="text" className={styles.formControl} defaultValue="Dataset Licensing" />
                </div>
                <div>
                  <input type="number" className={styles.formControl} placeholder="150,000" />
                </div>
                <div>
                  <input type="number" className={styles.formControl} placeholder="30" />
                </div>
              </div>
              <button className={styles.addBtn}>+ Add Allocation Row</button>
            </div>
          </motion.div>
        );
      }

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Current Product Status</h2>
              <p>Showcase current progress, user base, and revenue to build trust.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Development Stage</label>
                <select className={styles.formControl}>
                  <option value="">Select Stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Prototype Built</option>
                  <option value="beta">Beta Product</option>
                  <option value="live">Live Product</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Current Users (if any)</label>
                <input type="number" className={styles.formControl} placeholder="0" value={formData.userCount} onChange={(e) => setFormData({...formData, userCount: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Current Monthly Revenue (USDT)</label>
                <input type="number" className={styles.formControl} placeholder="0" />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '24px' }}>
              <label>Proof of Revenue / Traction (Stripe dashboard, financial reports)</label>
              <div className={styles.uploadArea}>
                <Upload size={32} className={styles.uploadIcon} />
                <p>Upload screenshots or PDFs</p>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Demo & Technical Proof</h2>
              <p>Provide evidence that your technology works and is feasible.</p>
            </div>

            <div className={styles.formGroup}>
              <label>Demo Video URL (YouTube, Vimeo, etc.)</label>
              <input type="url" className={styles.formControl} placeholder="https://youtube.com/watch?v=..." value={formData.demoVideo} onChange={(e) => setFormData({...formData, demoVideo: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <label>GitHub Repository / Code Link</label>
              <input type="url" className={styles.formControl} placeholder="https://github.com/..." />
            </div>

            <div className={styles.formGroup} style={{ marginTop: '24px' }}>
              <label>Whitepaper or Technical Architecture Document</label>
              <div className={styles.uploadArea}>
                <Upload size={32} className={styles.uploadIcon} />
                <p>Upload Whitepaper (PDF)</p>
              </div>
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '24px' }}>
              <label>Product Demo Recording (.mp4)</label>
              <div className={styles.uploadArea}>
                <Upload size={32} className={styles.uploadIcon} />
                <p>Upload Video Demo</p>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Roadmap & Milestones</h2>
              <p>Escrow funds are released based on these milestones. Be specific!</p>
            </div>

            <div className={styles.listContainer}>
              {/* Milestone 1 */}
              <div className={styles.listItem} style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Milestone 1: Infrastructure</label>
                  <input type="text" className={styles.formControl} placeholder="Procure H100 cluster on RunPod" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Est. Date</label>
                  <input type="date" className={styles.formControl} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Funds %</label>
                  <input type="number" className={styles.formControl} placeholder="30" />
                </div>
              </div>

              {/* Milestone 2 */}
              <div className={styles.listItem} style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Milestone 2: Dataset</label>
                  <input type="text" className={styles.formControl} placeholder="License medical imaging data" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Est. Date</label>
                  <input type="date" className={styles.formControl} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Funds %</label>
                  <input type="number" className={styles.formControl} placeholder="25" />
                </div>
              </div>

              {/* Milestone 3 & 4 */}
              <div className={styles.listItem} style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Milestone 3: Training</label>
                  <input type="text" className={styles.formControl} placeholder="Complete initial 100B param training run" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Est. Date</label>
                  <input type="date" className={styles.formControl} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Funds %</label>
                  <input type="number" className={styles.formControl} placeholder="25" />
                </div>
              </div>

              <div className={styles.listItem} style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Milestone 4: Product Launch</label>
                  <input type="text" className={styles.formControl} placeholder="Launch API & Dashboard" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Est. Date</label>
                  <input type="date" className={styles.formControl} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Funds %</label>
                  <input type="number" className={styles.formControl} placeholder="20" />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Revenue Model</h2>
              <p>Explain how the product generates revenue that will be distributed to token holders.</p>
            </div>

            <div className={styles.formGroup}>
              <label>Revenue Streams (Check all that apply)</label>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="rev1" className={styles.checkbox} />
                <label htmlFor="rev1">Pay-per-token API usage</label>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="rev2" className={styles.checkbox} />
                <label htmlFor="rev2">SaaS Subscriptions (B2C / B2B)</label>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="rev3" className={styles.checkbox} />
                <label htmlFor="rev3">Enterprise Licensing Agreements</label>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="rev4" className={styles.checkbox} />
                <label htmlFor="rev4">Data Analytics or Inference Services</label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Expected Yearly Revenue Projection (Year 1, USDT)</label>
              <input type="number" className={styles.formControl} placeholder="1,500,000" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Yield Distribution Strategy</label>
              <textarea 
                className={styles.formControl} 
                placeholder="Explain the percentage of revenue that will flow to the smart contract Oracle to buy back or distribute yield to token holders..."
                style={{ minHeight: '120px' }}
              />
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Contact & Community</h2>
              <p>Provide contact channels for admins and future investors.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Official Email</label>
                <input type="email" className={styles.formControl} placeholder="contact@nexus-ai.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Discord / Telegram Link</label>
                <input type="url" className={styles.formControl} placeholder="https://discord.gg/..." />
              </div>
              <div className={styles.formGroup}>
                <label>Twitter / X Account</label>
                <input type="url" className={styles.formControl} placeholder="https://x.com/..." />
              </div>
              <div className={styles.formGroup}>
                <label>Documentation / GitBook URL</label>
                <input type="url" className={styles.formControl} placeholder="https://docs.nexus-ai.com" />
              </div>
            </div>
          </motion.div>
        );

      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.sectionHeader}>
              <h2>Terms & Legal Agreement</h2>
              <p>Please review and accept platform compliance conditions before submission.</p>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup} style={{ borderLeft: '3px solid var(--color-primary)' }}>
                <input type="checkbox" id="term1" className={styles.checkbox} required />
                <label htmlFor="term1">
                  I confirm that all founder, corporate, and technological information provided is accurate. Submitting fraudulent KYB/KYC will result in permanent banning and potential legal reporting.
                </label>
              </div>
              
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="term2" className={styles.checkbox} required />
                <label htmlFor="term2">
                  I agree that funds raised through the platform will be strictly locked in escrow smart contracts and only distributed upon successful completion of the milestones defined in Section 6.
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="term3" className={styles.checkbox} required />
                <label htmlFor="term3">
                  I commit to the Revenue Sharing Agreement established via Oracles, ensuring token holders receive their fractional yield of the AI product revenue as formulated in Section 7.
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="term4" className={styles.checkbox} required />
                <label htmlFor="term4">
                  I accept the OmniAI Platform Terms of Service, AML/KYF Compliance clauses, and the 10% Platform Treasury allocation of the minted RWA tokens.
                </label>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  if (submissionStatus === 'review') {
    return (
      <div className={`container ${styles.pageContainer}`}>
        <Head><title>Status | OmniAI</title></Head>
        <div className={`glass ${styles.formSection}`} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className={`${styles.statusIcon} ${styles.review}`}>
            <Clock size={40} />
          </div>
          <h2 style={{ marginBottom: '16px' }}>Project Under Review</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
            Your startup application for "Nexus Foundation Model V2" has been successfully submitted! Our admin team is currently verifying your company documents, technical demo, and financial feasibility.
          </p>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '12px', textAlign: 'left', marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--color-text)' }}>Next Steps:</h4>
            <ul style={{ color: 'var(--color-muted)', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Admin verifies identity & corporate incorporation (1-2 days).</li>
              <li>Technical review of AI architecture and GitHub repo.</li>
              <li>Approval triggers token minting and smart contract deployment.</li>
              <li>Project gets listed on the Marketplace!</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => setSubmissionStatus('draft')} style={{ width: '100%' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Head>
        <title>Startup Project Submission | OmniAI</title>
      </Head>

      <div className={styles.header}>
        <h1>Pitch Your <span className="gradient-text">AI Startup</span></h1>
        <p>Complete the strict verification process to launch your tokenized funding campaign.</p>
      </div>

      <div className={styles.submissionLayout}>
        {/* Navigation Sidebar */}
        <div className={styles.sidebar}>
          <div className={`glass ${styles.stepNav}`} style={{ padding: '16px' }}>
            {steps.map((step) => (
              <button 
                key={step.id} 
                className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span className={styles.stepIcon}>
                  {currentStep > step.id ? <CheckCircle2 size={18} /> : step.icon}
                </span>
                <span>{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Form Area */}
        <div className={`glass ${styles.formSection}`}>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handlePrev}
                style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
              >
                <ChevronLeft size={18} style={{ marginRight: '8px' }}/> Back
              </button>

              {currentStep < steps.length ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next Step <ChevronRight size={18} style={{ marginLeft: '8px' }}/>
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-secondary), #059669)' }}>
                  Submit for Admin Review <CheckSquare size={18} style={{ marginLeft: '8px' }}/>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
