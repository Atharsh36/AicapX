const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── In-memory Database (MVP) ────────────────────────────────────────────────
// Statuses: "Under Review" | "Active" | "Rejected"
let applications = [
  {
    id:              1,
    name:            "AutoAgent Systems",
    startupName:     "AutoAgent Labs",
    category:        "Autonomous Agents",
    desc:            "Developing autonomous web-navigating agents capable of executing multi-step enterprise workflows using specialized small language models.",
    goal:            200000,
    tokenSupply:     10000,
    tokenPrice:      20,
    raised:          0,
    apy:             "18-25%",
    status:          "Active",
    founderName:     "Alex Rivera",
    startupWallet:   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    documents:       ["Cert_of_Inc.pdf", "Founders_ID.pdf", "Company_Logo.png"],
    demoVideo:       "https://youtube.com/watch?v=demo123",
    revenueProof:    "Stripe_Dashboard_2024.pdf",
    userCount:       1540,
    contractAddress: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    onChainProjectId: 1,
    mintTxHash:      null,
    explorerLink:    "https://testnet.bscscan.com/address/0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    createdAt:       Date.now() - 86400000,
    approvedAt:      Date.now() - 3600000
  }
];
let nextId = 2;

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── GET /api/applications ──────────────────────────────────────────────────
// Query params: ?status=Active | Under Review | Rejected
app.get('/api/applications', (req, res) => {
  const { status } = req.query;
  const result = status
    ? applications.filter(a => a.status === status)
    : applications;
  res.json(result);
});

// ─── GET /api/applications/:id ───────────────────────────────────────────────
app.get('/api/applications/:id', (req, res) => {
  const app_ = applications.find(a => a.id === parseInt(req.params.id));
  if (!app_) return res.status(404).json({ error: 'Application not found' });
  res.json(app_);
});

// ─── POST /api/applications ─────────────────────────────────────────────────
// Startup submission → status auto-set to "Under Review"
app.post('/api/applications', (req, res) => {
  const {
    name, startupName, category, desc,
    goal, tokenSupply, apy,
    founderName, founderEmail, founderPhone, founderLinkedIn,
    companyWebsite, registrationNumber, country,
    startupWallet,
    documents,
    demoVideo, githubLink, revenueProof, userCount,
    revenueStreams, yearOneRevenue, yieldStrategy,
    contactEmail, discord, twitter, docsUrl,
    developmentStage
  } = req.body;

  const parsedGoal   = parseInt(goal)        || 0;
  const parsedSupply = parseInt(tokenSupply) || 0;

  const newApp = {
    id:              nextId++,
    name:            name           || 'Unnamed Project',
    startupName:     startupName    || 'AI Startup',
    category:        category       || 'Other',
    desc:            desc           || '',
    goal:            parsedGoal,
    tokenSupply:     parsedSupply,
    tokenPrice:      parsedGoal && parsedSupply ? parsedGoal / parsedSupply : 0,
    raised:          0,
    apy:             apy            || '10-20%',
    status:          'Under Review',            // ← Always starts here

    // Founder / Company
    founderName:         founderName     || 'Anonymous',
    founderEmail:        founderEmail    || '',
    founderPhone:        founderPhone    || '',
    founderLinkedIn:     founderLinkedIn || '',
    companyWebsite:      companyWebsite  || '',
    registrationNumber:  registrationNumber || '',
    country:             country         || '',

    // Blockchain
    startupWallet:       startupWallet   || '0x0000000000000000000000000000000000000000',
    contractAddress:     null,
    onChainProjectId:    null,
    mintTxHash:          null,
    explorerLink:        null,

    // Documents & media
    documents:       Array.isArray(documents) ? documents : [],
    demoVideo:       demoVideo      || '',
    githubLink:      githubLink     || '',
    revenueProof:    revenueProof   || '',
    userCount:       parseInt(userCount) || 0,
    developmentStage: developmentStage || '',

    // Revenue model
    revenueStreams:  revenueStreams  || [],
    yearOneRevenue:  yearOneRevenue  || '',
    yieldStrategy:   yieldStrategy  || '',

    // Contact
    contactEmail:    contactEmail    || '',
    discord:         discord         || '',
    twitter:         twitter         || '',
    docsUrl:         docsUrl         || '',

    createdAt:       Date.now(),
    approvedAt:      null
  };

  applications.push(newApp);
  console.log(`[POST] New application submitted: "${newApp.name}" (id=${newApp.id})`);

  res.status(201).json({
    message:     'Application submitted successfully!',
    application: newApp
  });
});

// ─── PUT /api/applications/:id/status ───────────────────────────────────────
// Admin approves / rejects / activates
app.put('/api/applications/:id/status', (req, res) => {
  const appId = parseInt(req.params.id);
  const {
    status, contractAddress, explorerLink,
    mintTxHash, onChainProjectId
  } = req.body;

  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return res.status(404).json({ error: 'Application not found' });

  const app_ = applications[idx];

  if (status)            app_.status         = status;
  if (contractAddress)   app_.contractAddress  = contractAddress;
  if (explorerLink)      app_.explorerLink     = explorerLink;
  if (mintTxHash)        app_.mintTxHash       = mintTxHash;
  if (onChainProjectId != null) app_.onChainProjectId = onChainProjectId;

  if (status === 'Active') {
    app_.approvedAt = Date.now();
    console.log(`[ADMIN] Project "${app_.name}" approved & minted → ${contractAddress}`);
  }
  if (status === 'Rejected') {
    console.log(`[ADMIN] Project "${app_.name}" rejected.`);
  }

  res.json({ message: `Status updated to ${status}`, application: app_ });
});

// ─── PUT /api/applications/:id/raise ────────────────────────────────────────
// Called by event listener when an invest() tx is confirmed on-chain
app.put('/api/applications/:id/raise', (req, res) => {
  const appId  = parseInt(req.params.id);
  const { amount } = req.body; // USD amount
  const idx = applications.findIndex(a => a.id === appId);
  if (idx === -1) return res.status(404).json({ error: 'Application not found' });
  applications[idx].raised = (applications[idx].raised || 0) + parseFloat(amount || 0);
  res.json({ raised: applications[idx].raised });
});

// ─── GET /api/stats ─────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const active   = applications.filter(a => a.status === 'Active').length;
  const pending  = applications.filter(a => a.status === 'Under Review').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;
  const totalRaised = applications.reduce((sum, a) => sum + (a.raised || 0), 0);
  res.json({ active, pending, rejected, totalRaised, total: applications.length });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 OmniAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET  /api/applications?status=Active`);
  console.log(`   GET  /api/applications?status=Under+Review`);
  console.log(`   POST /api/applications`);
  console.log(`   PUT  /api/applications/:id/status`);
  console.log(`   GET  /api/stats\n`);
});
