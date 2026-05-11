// @ts-nocheck
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutDashboard, PlusCircle, Globe, ShieldCheck, CheckCircle2, Layers, Lock, Code, ArrowUpRight, X, ExternalLink, Copy } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// =============================================================================
// BIFROST DESIGN SYSTEM
// =============================================================================

const globalStyles = `
@import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');

body {
  font-family: 'General Sans', -apple-system, sans-serif;
  background: #000;
  color: #fff;
  overflow-x: hidden;
}

.hero-title {
  letter-spacing: -0.06em;
  line-height: 0.85;
  text-transform: lowercase;
}

.fusion-blur-shape {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 800px;
  height: 400px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(80px);
  transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.bridge-active .fusion-blur-shape {
  max-width: 1500px;
  height: 800px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(40px);
}

.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
`;

// =============================================================================
// MAIN BIFROST APPLICATION (ROUTER)
// =============================================================================

export default function BifrostApp() {
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [view, setView] = useState('landing'); 
  const [productTitle, setProductTitle] = useState("Creator Masterclass");
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    if (connected && view === 'landing') {
      setView('connecting');
      setTimeout(() => setView('dashboard'), 2800);
    }
    if (!connected && (view === 'dashboard' || view === 'checkout_preview')) {
      setView('landing');
    }
  }, [connected, view]);

  const handleStart = () => connected ? setView('dashboard') : setVisible(true);
  const handleDisconnect = async () => { 
    try { await disconnect(); } catch (e) {} // Ignore disconnect errors in test mode
    setView('landing'); 
  };

  const addressShort = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "Not Connected";
  const walletName = wallet?.adapter?.name || "Solana Node";

  return (
    <div className={`relative w-full bg-black min-h-screen overflow-y-auto ${view === 'connecting' ? 'bridge-active' : ''}`}>
      <style>{globalStyles}</style>
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-[0.15] grayscale" autoPlay loop muted playsInline src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="fusion-blur-shape" />
      </div>
      
      <AnimatePresence>
        {view === 'landing' && (
          <LandingPage key="landing" productTitle={productTitle} setProductTitle={setProductTitle} onStart={handleStart} />
        )}
        
        {view === 'connecting' && <BridgeSequence key="connecting" walletName={walletName} />}
        
        {view === 'dashboard' && (
          <Dashboard 
            key="dashboard" 
            address={addressShort} 
            onBack={handleDisconnect} 
            onSimulateCheckout={(link) => { setActiveLink(link); setView('checkout_preview'); }}
            onOpenLivePortal={(link) => { setActiveLink(link); setView('live_customer_portal'); }}
          />
        )}
        
        {view === 'checkout_preview' && activeLink && (
          <CustomerCheckoutPreview key="checkout" linkData={activeLink} onBack={() => setView('dashboard')} />
        )}

        {view === 'live_customer_portal' && activeLink && (
          <LiveCustomerPortal key="live_portal" linkData={activeLink} onReturnToDashboard={() => setView('dashboard')} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: LIVE CUSTOMER PORTAL
// =============================================================================

const LiveCustomerPortal = ({ linkData, onReturnToDashboard }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-y-auto py-10 px-4">
      
      {/* THE FIX: Professional Close Button */}
      <button onClick={onReturnToDashboard} className="absolute top-6 left-6 md:top-10 md:left-10 text-white/40 hover:text-white uppercase text-[9px] md:text-[10px] tracking-[0.2em] font-bold transition-all flex items-center gap-2 z-50 bg-white/5 hover:bg-white/10 px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10">
        <X size={14} /> Close Checkout
      </button>

      <div className="fusion-blur-shape opacity-40" />

      <div className="relative z-10 w-full max-w-[400px] mb-8 text-center">
        <div className="w-12 h-12 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Layers className="text-white/40" size={20} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">Secure Checkout</p>
        <h1 className="text-2xl font-bold tracking-tighter italic text-white/90">{linkData.name}</h1>
      </div>

      <div className="w-full max-w-[400px]">
        <BifrostCheckoutWidget 
          productName={linkData.name} 
          priceUsd={linkData.price} 
          availableChains={linkData.chains} 
          isPreviewMode={false}
        />
      </div>

      <div className="mt-10 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-white/20">
          <ShieldCheck size={12} className="text-green-500/50" />
          Cross-chain routing via KiraPay Protocol
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// SUB-COMPONENT: LANDING PAGE
// =============================================================================

const LandingPage = ({ onStart, productTitle, setProductTitle }) => {
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };

  return (
    <div className="relative w-full z-10">
      <section className="relative h-[90vh] md:min-h-screen w-full flex flex-col pt-20 md:pt-24 pb-6 lg:pb-0">
        <nav className="absolute top-0 left-0 w-full p-4 md:p-8 lg:p-10 flex justify-between items-center z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            <span className="text-sm md:text-xl font-bold tracking-tighter italic uppercase">bifrost</span>
          </div>
          <button onClick={onStart} className="bg-white text-black px-5 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:invert transition-all">
            Get Started
          </button>
        </nav>

        <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-4 md:px-10 mt-6 lg:mt-0">
          <div className="flex flex-row items-center justify-between w-full gap-2 md:gap-8">
            <div className="w-[50%] lg:w-[60%] flex flex-col justify-center text-left">
              <h1 className="hero-title text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-bold leading-[0.85]">protect</h1>
              <h1 className="hero-title text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-bold leading-[0.85] pl-6 md:pl-16 md:-mt-2">your</h1>
              <h1 className="hero-title text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-bold leading-[0.85] md:-mt-2">data</h1>
              
              <div className="mt-6 md:mt-12 flex flex-col items-start gap-4 md:gap-6 w-full">
                <div className="glass-card p-1.5 md:p-2 pl-3 md:pl-6 rounded-xl md:rounded-2xl w-full max-w-[200px] md:max-w-md lg:w-fit flex items-center justify-between gap-2 md:gap-4 border-white/5 hover:border-white/10 transition-all">
                  <span className="text-[7px] md:text-[10px] uppercase tracking-widest text-white/30 hidden sm:block">Preview:</span>
                  <input 
                    type="text" value={productTitle} onChange={(e) => setProductTitle(e.target.value)}
                    className="bg-transparent border-none outline-none text-[9px] md:text-sm font-bold tracking-tight w-full sm:w-32 md:w-48 text-white placeholder:text-white/10"
                  />
                  <button onClick={onStart} className="bg-white/10 hover:bg-white/20 p-1.5 px-3 md:p-2.5 md:px-5 rounded-lg md:rounded-xl text-[7px] md:text-[10px] font-bold uppercase transition-all shrink-0">Launch</button>
                </div>
                <p className="max-w-[150px] md:max-w-sm text-[7px] md:text-[10px] text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
                  Autonomous intent infrastructure for sovereign settlement.
                </p>
              </div>
            </div>

            <div className="w-[50%] lg:w-[40%] flex justify-end items-center">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} 
                className="w-full origin-right scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 max-w-[360px]"
              >
                <BifrostCheckoutWidget 
                  productName={productTitle} 
                  priceUsd={49.99} 
                  isPreviewMode={true} 
                  onPreviewStart={onStart} 
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 space-y-20 md:space-y-40 pb-20 md:pb-40 mt-[-5vh] md:mt-0">
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="pt-10 md:pt-20">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-purple-400 mb-3 md:mb-6 text-center">The Paradigm Shift</p>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-center italic mb-8 md:mb-16">Sovereign settlement.<br/>Zero intermediaries.</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              { i: <ShieldCheck size={18}/>, t: "Zero-Knowledge", d: "Cryptographically guaranteed privacy." },
              { i: <Zap size={18}/>, t: "Agentic Routing", d: "Optimal cross-chain pathfinding." },
              { i: <Layers size={18}/>, t: "Universal Liquidity", d: "Pay any asset. Receive stablecoins." }
            ].map((v, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[70vw] md:w-auto glass-card p-5 md:p-10 rounded-[20px] md:rounded-[30px] border-white/5 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-purple-400">{v.i}</div>
                <h3 className="text-sm md:text-xl font-bold mb-2 md:mb-3">{v.t}</h3>
                <p className="text-[10px] md:text-sm text-white/40 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-6 md:mb-10 italic">Core Infrastructure</h2>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-6 lg:auto-rows-[280px]">
            <div className="col-span-2 md:col-span-8 glass-card rounded-[20px] md:rounded-[40px] p-5 md:p-10 flex flex-col justify-between overflow-hidden relative group min-h-[140px] md:min-h-0">
              <div className="relative z-10">
                <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2">Intent Architecture</h3>
                <p className="text-white/40 max-w-[200px] md:max-w-sm text-[9px] md:text-sm">Build real autonomous use cases on Layer 1 infrastructure.</p>
              </div>
              <Code className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-24 h-24 md:w-64 md:h-64 text-white/5 group-hover:text-purple-500/10 transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-4 glass-card rounded-[20px] md:rounded-[40px] p-5 md:p-10 flex flex-col justify-between bg-purple-900/10 border-purple-500/20">
              <Lock className="w-5 h-5 md:w-8 md:h-8 text-purple-400 mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-bold">Non-Custodial</h3>
              <p className="text-white/40 text-[8px] md:text-xs mt-1 md:mt-2">Direct settlement via smart contracts.</p>
            </div>
            <div className="col-span-1 md:col-span-4 glass-card rounded-[20px] md:rounded-[40px] p-5 md:p-10 flex flex-col justify-between">
              <LayoutDashboard className="w-5 h-5 md:w-8 md:h-8 text-white/40 mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-bold">Developer UI</h3>
              <p className="text-white/40 text-[8px] md:text-xs mt-1 md:mt-2">Dashboard for Web3 builders.</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="py-10 md:py-20 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-full max-w-[600px] h-[150px] md:h-[300px] bg-purple-600/20 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tighter italic mb-4 md:mb-6 relative z-10 px-4">Ready to build?</h2>
          <p className="text-[10px] md:text-sm text-white/40 mb-8 md:mb-10 max-w-[200px] md:max-w-md mx-auto relative z-10 px-6">Deploy your cross-chain intent gateway in under 60 seconds.</p>
          <button onClick={onStart} className="relative z-10 bg-white text-black px-8 md:px-12 py-3 md:py-5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform">
            Connect Wallet
          </button>
        </motion.section>
      </div>

      <footer className="border-t border-white/5 py-6 md:py-10 px-6 md:px-20 relative z-10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full" />
            <span className="font-bold tracking-tighter italic uppercase text-[10px] md:text-sm">bifrost</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] md:text-[10px] uppercase tracking-widest text-white/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Protocol: Online
          </div>
        </div>
      </footer>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: THE BRIDGE SEQUENCE
// =============================================================================

const BridgeSequence = ({ walletName }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }} className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black px-6 text-center">
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
      <div className="relative">
        <Zap className="text-white animate-pulse w-10 h-10 md:w-12 md:h-12" />
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-purple-500 rounded-full blur-2xl" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tighter uppercase italic">Initializing Bifrost</h2>
        <p className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-3">Securing Bridge to {walletName}...</p>
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SUB-COMPONENT: DASHBOARD WITH LINK SHARING
// =============================================================================

const Dashboard = ({ address, onBack, onSimulateCheckout, onOpenLivePortal }) => {
  const [links, setLinks] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [balances, setBalances] = useState({ base: 1000, eth: 1000, sol: 1000 });
  const [transactions, setTransactions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'analytics'
  const [realPayments, setRealPayments] = useState([]); // Actual blockchain payments
  const [zkMode, setZkMode] = useState(false);

  useEffect(() => {
    const savedLinks = localStorage.getItem('bifrost_merchant_links');
    const savedBalances = localStorage.getItem('bifrost_test_balances');
    const savedTxns = localStorage.getItem('bifrost_transactions');
    const savedPayments = localStorage.getItem('bifrost_real_payments');
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse saved links");
      }
    }
    if (savedBalances) {
      try {
        setBalances(JSON.parse(savedBalances));
      } catch (e) {
        setBalances({ base: 1000, eth: 1000, sol: 1000 });
      }
    }
    if (savedTxns) {
      try {
        setTransactions(JSON.parse(savedTxns));
      } catch (e) {
        console.error("Failed to parse transactions");
      }
    }
    if (savedPayments) {
      try {
        setRealPayments(JSON.parse(savedPayments));
      } catch (e) {
        console.error("Failed to parse real payments");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bifrost_merchant_links', JSON.stringify(links));
      localStorage.setItem('bifrost_test_balances', JSON.stringify(balances));
      localStorage.setItem('bifrost_transactions', JSON.stringify(transactions));
      localStorage.setItem('bifrost_real_payments', JSON.stringify(realPayments));
    }
  }, [links, balances, transactions, realPayments, isLoaded]);

  const getChainKey = (chainName) => {
    const lower = chainName.toLowerCase();
    if (lower.startsWith('base')) return 'base';
    if (lower.startsWith('eth')) return 'eth';
    if (lower.startsWith('sol')) return 'sol';
    return lower;
  };

  const handleCreateLink = (newLink) => { 
    setLinks([newLink, ...links]); 
    setIsCreating(false); 
  };

  const deductBalance = (chain, amount, productName) => {
    const key = getChainKey(chain);
    setBalances(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] - amount)
    }));
    const txn = {
      id: Date.now(),
      chain,
      product: productName,
      amount,
      timestamp: new Date().toLocaleTimeString(),
      remaining: Math.max(0, balances[key] - amount)
    };
    setTransactions(prev => [txn, ...prev]);
  };

  const handleResetChainBalance = (chain) => {
    const key = getChainKey(chain);
    if(confirm(`Reset ${chain} balance to $1000?`)) {
      setBalances(prev => ({ ...prev, [key]: 1000 }));
      setTransactions(prev => [{
        id: Date.now(),
        chain,
        product: 'BALANCE RESET',
        amount: 1000 - balances[key],
        timestamp: new Date().toLocaleTimeString(),
        remaining: 1000
      }, ...prev]);
    }
  };

  const handleClearData = () => {
    if(confirm("Clear all merchant data?")) {
      setLinks([]);
      localStorage.removeItem('bifrost_merchant_links');
    }
  };

  // ANALYTICS CALCULATIONS
  const totalRevenue = realPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalTestSpend = transactions.filter(t => t.product !== 'BALANCE RESET').reduce((sum, t) => sum + t.amount, 0);
  const conversionRate = transactions.length > 0 ? (realPayments.length / transactions.length * 100).toFixed(1) : 0;

  const chainPerformance = ['Base', 'Eth', 'Sol'].map(chain => {
    const chainPayments = realPayments.filter(p => p.chain === chain);
    const chainRevenue = chainPayments.reduce((sum, p) => sum + p.amount, 0);
    const chainTests = transactions.filter(t => t.chain === chain && t.product !== 'BALANCE RESET').length;
    return {
      chain,
      revenue: chainRevenue,
      transactions: chainPayments.length,
      tests: chainTests,
      conversion: chainTests > 0 ? (chainPayments.length / chainTests * 100).toFixed(1) : 0
    };
  });

  const topProducts = links.map(link => {
    const productPayments = realPayments.filter(p => p.product === link.name);
    const productRevenue = productPayments.reduce((sum, p) => sum + p.amount, 0);
    return {
      name: link.name,
      revenue: productRevenue,
      sales: productPayments.length,
      price: link.price
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const recentActivity = [...realPayments, ...transactions.filter(t => t.product !== 'BALANCE RESET')]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  // Simulate real payment (for demo purposes)
  const simulateRealPayment = (link) => {
    const payment = {
      id: Date.now(),
      product: link.name,
      amount: parseFloat(link.price),
      chain: link.chains[Math.floor(Math.random() * link.chains.length)], // Random chain from available
      timestamp: new Date().toLocaleString(),
      customerAddress: '7nxB...' + Math.random().toString(36).substr(2, 4),
      txHash: 'tx_' + Math.random().toString(36).substr(2, 9)
    };
    setRealPayments(prev => [payment, ...prev]);
  };

  const handleCopyLink = (name) => {
    const urlSlug = name.replace(/\s+/g, '-').toLowerCase();
    const fullUrl = `${window.location.origin}/pay/${urlSlug}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Copied link to clipboard:\n${fullUrl}`);
  };

  const totalVolume = links.reduce((sum, link) => sum + parseFloat(link.price), 0);
  const formattedVolume = totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative h-[100dvh] w-full p-3 sm:p-6 md:p-10 flex flex-col gap-4 md:gap-10 bg-[#020202]">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors p-1 md:p-2"><ArrowUpRight className="rotate-180 w-4 h-4 md:w-5 md:h-5"/></button>
          <div className="h-6 md:h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setView('dashboard')} 
              className={`text-[10px] md:text-sm font-bold tracking-tighter uppercase transition-colors ${view === 'dashboard' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Terminal
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button 
              onClick={() => setView('analytics')} 
              className={`text-[10px] md:text-sm font-bold tracking-tighter uppercase transition-colors ${view === 'analytics' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
             Analytics
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex glass-card px-4 py-3 rounded-xl md:rounded-2xl items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 shrink-0">
            <Globe size={10} className="text-purple-400" /> Stable
          </div>
          
          {/* THE NEW ZK SHIELD TOGGLE BUTTON */}
          <button 
            onClick={() => setZkMode(!zkMode)}
            className={`px-3 py-2 md:px-4 md:py-3 rounded-[10px] md:rounded-2xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest shrink-0 transition-all border ${zkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
          >
            {zkMode ? 'ZK Shield: ON' : 'ZK Shield: OFF'}
          </button>
          
          <div className="bg-white text-black px-3 py-2 md:px-4 md:py-3 rounded-[10px] md:rounded-2xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest shrink-0">
            {address}
          </div>
        </div>
      </div>

      {view === 'dashboard' ? (
        <>
          <div className="flex flex-row gap-3 md:gap-8 flex-1 min-h-0">
            <div className="w-[35%] lg:w-[25%] flex flex-col gap-3 md:gap-6">
              {/* TEST BALANCE CARD */}
              <div className="glass-card p-4 md:p-8 rounded-[16px] md:rounded-[40px] flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar relative group">
                <div className="mb-4 lg:mb-0">
                  <p className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 mb-1 md:mb-2">Test Balance</p>
                 <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
  {zkMode ? '$***.**' : `$${(balances.base + balances.eth + balances.sol).toLocaleString(undefined, {maximumFractionDigits:0})}`}
</h3>
                </div>
                
                <div className="space-y-4 md:space-y-6 mb-4">
                  {['Base', 'Eth', 'Sol'].map((c) => {
                    const key = getChainKey(c);
                    const balance = balances[key];
                    const percent = (balance / 1000) * 100;
                    const statusColor = percent > 50 ? 'bg-green-500/50' : percent > 20 ? 'bg-yellow-500/50' : 'bg-red-500/50';
                    const textColor = percent > 50 ? 'text-green-400' : percent > 20 ? 'text-yellow-400' : 'text-red-400';
                    
                    return (
                      <div key={c} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[7px] md:text-[9px] uppercase tracking-[0.15em]">
                          <span className="text-white/40">{c}</span>
                          <span className={`font-bold ${textColor}`}>${balance.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                        <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${statusColor} transition-all duration-300`} style={{ width: `${percent}%` }} />
                        </div>
                        <button onClick={() => handleResetChainBalance(c)} className="text-[6px] md:text-[7px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest">Reset</button>
                      </div>
                    );
                  })}
                </div>

                {/* TRANSACTION HISTORY TOGGLE */}
                <button onClick={() => setShowHistory(!showHistory)} className="text-[7px] md:text-[8px] text-purple-400/60 hover:text-purple-400 transition-colors uppercase tracking-widest w-full py-2 border-t border-white/10 mt-auto">
                  {showHistory ? '▼ Hide' : '▶ Show'} History ({transactions.length})
                </button>
              </div>

              {/* TRANSACTION HISTORY CARD (COLLAPSIBLE) */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-3 md:p-6 rounded-[16px] md:rounded-[30px] max-h-[300px] overflow-y-auto hide-scrollbar">
                    <p className="text-[6px] md:text-[8px] uppercase tracking-[0.2em] text-white/30 mb-3 md:mb-4 block">Transaction Log</p>
                    <div className="space-y-2 md:space-y-3">
                      {transactions.length === 0 ? (
                        <p className="text-[7px] text-white/20 italic">No transactions yet</p>
                      ) : (
                        transactions.map((txn) => (
                          <div key={txn.id} className="text-[6px] md:text-[8px] border-l-2 border-purple-500/30 pl-2 md:pl-3 py-1">
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-white/40">{txn.product === 'BALANCE RESET' ? '↻ ' : '⊖ '}{txn.product.slice(0, 16)}</span>
                              <span className={txn.product === 'BALANCE RESET' ? 'text-green-400' : 'text-red-300'}>-${txn.amount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                            </div>
                            <div className="text-[5px] md:text-[7px] text-white/20 mt-0.5">{txn.chain} · {txn.timestamp}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-[65%] lg:w-[75%] glass-card rounded-[16px] md:rounded-[40px] p-4 md:p-10 flex flex-col relative overflow-hidden">
              <div className="flex flex-row justify-between items-center gap-2 mb-4 md:mb-10">
                <div>
                  <h4 className="text-sm md:text-3xl font-bold tracking-tighter italic uppercase">Intent Links</h4>
                  <p className="hidden md:block text-white/30 text-[10px] uppercase tracking-[0.2em] mt-2">Manage your gateways</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="flex justify-center items-center gap-1.5 md:gap-2 bg-white text-black hover:bg-neutral-200 px-3 py-2 md:px-6 md:py-4 rounded-lg md:rounded-2xl font-bold text-[7px] md:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap">
                  <PlusCircle size={10} className="md:w-3 md:h-3" /> New
                </button>
              </div>

              {links.length === 0 ? (
                <div className="flex-1 border border-dashed border-white/10 rounded-[12px] md:rounded-[30px] flex flex-col items-center justify-center text-white/20 p-4 text-center">
                  <div className="w-8 h-8 md:w-16 md:h-16 rounded-full border border-current flex items-center justify-center mb-2 md:mb-6 opacity-50"><LayoutDashboard className="w-4 h-4 md:w-8 md:h-8" /></div>
                  <p className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em]">Initialize intent</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-6 overflow-y-auto pb-4 pr-2 hide-scrollbar">
                  {links.map((link, idx) => (
                    <div key={idx} className="glass-card p-3 md:p-6 rounded-[12px] md:rounded-[24px] border-white/5 flex flex-col justify-between group">
                      <div className="flex justify-between items-start mb-3 md:mb-6">
                        <div className="w-full pr-2">
                          <h5 className="font-bold text-[10px] md:text-lg truncate">{link.name}</h5>
                          <p className="text-[6px] md:text-[10px] text-white/40 uppercase tracking-widest mt-1">Cross-chain</p>
                        </div>
                        <span className="text-[10px] md:text-xl font-light">${link.price}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-auto">
                        <div className="flex gap-1 md:gap-2 flex-wrap mb-2">
                          {link.chains.map(c => (<span key={c} className="bg-white/5 px-1.5 md:px-3 py-0.5 md:py-1 rounded-sm md:rounded-full text-[6px] md:text-[9px] uppercase tracking-widest text-white/50">{c.slice(0,3)}</span>))}
                        </div>
                        
                        <div className="flex gap-2 w-full">
                          <button onClick={() => handleCopyLink(link.name)} className="flex-1 flex justify-center items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-1.5 md:py-2 rounded-md md:rounded-lg uppercase tracking-widest font-bold text-[6px] md:text-[8px] transition-all">
                            <Copy size={10} /> Copy Link
                          </button>
                          <button onClick={() => {
                            const selectedChain = link.chains[0];
                            const key = getChainKey(selectedChain);
                            const balance = balances[key];
                            const priceNum = parseFloat(link.price);
                            
                            if (balance < priceNum) {
                              alert(`Insufficient balance on ${selectedChain}!\nCurrent: $${balance} | Required: $${priceNum}`);
                            } else {
                              deductBalance(selectedChain, priceNum, link.name);
                              onSimulateCheckout(link);
                            }
                          }} className="flex-1 bg-purple-500/10 text-purple-400 py-1.5 md:py-2 rounded-md md:rounded-lg uppercase tracking-widest font-bold text-[6px] md:text-[8px] hover:bg-purple-500 hover:text-white transition-all">
                            Preview
                          </button>
                          <button onClick={() => onOpenLivePortal(link)} className="flex-1 flex justify-center items-center gap-1.5 bg-white text-black py-1.5 md:py-2 rounded-md md:rounded-lg uppercase tracking-widest font-bold text-[6px] md:text-[8px] hover:scale-105 transition-all">
                            Live Portal <ExternalLink size={10} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // ANALYTICS VIEW
        <div className="flex flex-row gap-3 md:gap-8 flex-1 min-h-0">
          {/* LEFT COLUMN - METRICS */}
          <div className="w-[35%] lg:w-[25%] flex flex-col gap-3 md:gap-6">
            {/* REVENUE METRICS */}
            <div className="glass-card p-4 md:p-8 rounded-[16px] md:rounded-[40px] flex-1 flex flex-col justify-between">
              <div className="mb-4 lg:mb-0">
                <p className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 mb-1 md:mb-2">Total Revenue</p>
               <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
  {zkMode ? '$***.**' : `$${totalRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}`}
</h3>
              </div>
              
              <div className="space-y-3 md:space-y-5">
                <div className="flex justify-between items-center text-[7px] md:text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-white/40">Live Payments</span>
                  <span className="font-bold text-green-400">{realPayments.length}</span>
                </div>
                <div className="flex justify-between items-center text-[7px] md:text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-white/40">Test Spend</span>
                  <span className="font-bold text-yellow-400">${totalTestSpend.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <div className="flex justify-between items-center text-[7px] md:text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-white/40">Conversion Rate</span>
                  <span className="font-bold text-purple-400">{conversionRate}%</span>
                </div>
              </div>
            </div>

            {/* CHAIN PERFORMANCE */}
            <div className="glass-card p-4 md:p-6 rounded-[16px] md:rounded-[30px] max-h-[300px] overflow-y-auto hide-scrollbar">
              <p className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 md:mb-4">Chain Performance</p>
              <div className="space-y-3 md:space-y-4">
                {chainPerformance.map((chain) => (
                  <div key={chain.chain} className="space-y-1">
                    <div className="flex justify-between items-center text-[6px] md:text-[8px] uppercase tracking-[0.15em]">
                      <span className="text-white/40">{chain.chain}</span>
                      <span className="font-bold text-green-400">${chain.revenue.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="text-[5px] md:text-[7px] text-white/20">
                      {chain.transactions} txns · {chain.conversion}% conv
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - CHARTS & DETAILS */}
          <div className="w-[65%] lg:w-[75%] flex flex-col gap-3 md:gap-6">
            {/* TOP PRODUCTS */}
            <div className="glass-card p-4 md:p-8 rounded-[16px] md:rounded-[40px] flex-1">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h4 className="text-sm md:text-2xl font-bold tracking-tighter italic uppercase">Top Products</h4>
                <button onClick={() => setIsCreating(true)} className="bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl text-[7px] md:text-[10px] font-bold uppercase tracking-widest transition-all">
                  + Add Product
                </button>
              </div>
              
              <div className="space-y-3 md:space-y-4 overflow-y-auto max-h-[200px] hide-scrollbar">
                {topProducts.length === 0 ? (
                  <p className="text-[8px] md:text-[10px] text-white/20 italic">No sales data yet</p>
                ) : (
                  <>
                    {realPayments.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 p-3 mb-3 text-[8px] md:text-[10px] text-white/50 bg-white/5">
                        Demo tip: press the <span className="text-white">Simulate sale</span> button for a product to generate live revenue and populate analytics.
                      </div>
                    )}
                    {topProducts.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-white/5">
                        <div className="flex-1">
                          <h5 className="font-bold text-[8px] md:text-sm truncate">{product.name}</h5>
                          <p className="text-[6px] md:text-[8px] text-white/40">{product.sales} sales</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-bold text-[8px] md:text-sm text-green-400">${product.revenue.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                            <p className="text-[6px] md:text-[8px] text-white/40">${product.price}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const link = links.find(l => l.name === product.name);
                              if (link) simulateRealPayment(link);
                            }}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded text-[7px] md:text-[9px] font-bold uppercase tracking-widest transition-all"
                          >
                            Simulate sale
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="glass-card p-4 md:p-8 rounded-[16px] md:rounded-[40px] flex-1">
              <h4 className="text-sm md:text-2xl font-bold tracking-tighter italic uppercase mb-4 md:mb-6">Recent Activity</h4>
              
              <div className="space-y-2 md:space-y-3 overflow-y-auto max-h-[250px] hide-scrollbar">
                {recentActivity.length === 0 ? (
                  <p className="text-[8px] md:text-[10px] text-white/20 italic">No activity yet</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id || activity.timestamp} className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-white/5">
                      <div className="flex-1">
                        <h5 className="font-bold text-[7px] md:text-[10px] truncate">
                          {activity.product || activity.name}
                        </h5>
                        <p className="text-[5px] md:text-[7px] text-white/40">
                          {activity.chain} · {activity.timestamp}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-[7px] md:text-[10px] ${activity.txHash ? 'text-green-400' : 'text-yellow-400'}`}>
                          {activity.txHash ? '+' : '-'}${activity.amount.toLocaleString(undefined, {maximumFractionDigits:0})}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isCreating && <CreateLinkModal onClose={() => setIsCreating(false)} onSubmit={handleCreateLink} />}
      </AnimatePresence>
    </motion.section>
  );
};

// =============================================================================
// SUB-COMPONENT: CREATE LINK MODAL
// =============================================================================

const CreateLinkModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedChains, setSelectedChains] = useState(['Solana']); 

  const toggleChain = (chain) => {
    if (selectedChains.includes(chain)) {
      if (selectedChains.length > 1) setSelectedChains(selectedChains.filter(c => c !== chain));
    } else { setSelectedChains([...selectedChains, chain]); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-[500px] glass-card rounded-[20px] md:rounded-[40px] p-5 md:p-10 relative border-white/10 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg md:text-2xl font-bold tracking-tighter italic uppercase mb-4 md:mb-8">Generate Link</h3>
        <div className="space-y-3 md:space-y-6">
          <div>
            <label className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 block mb-1.5 md:mb-2">Product Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-xs md:text-sm outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Premium Access" />
          </div>
          <div>
            <label className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 block mb-1.5 md:mb-2">Price (USD)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-xs md:text-sm outline-none focus:border-purple-500 transition-colors" placeholder="0.00" />
          </div>
          <div>
            <label className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 block mb-1.5 md:mb-2">Settlement Chains</label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {['Solana', 'Base', 'Eth'].map(c => (
                <button key={c} onClick={() => toggleChain(c)} className={`border text-center py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] uppercase tracking-widest transition-all ${selectedChains.includes(c) ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 mt-6 md:mt-10">
          <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 md:py-4 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all">Cancel</button>
          <button onClick={() => { if(name && price) onSubmit({ name, price, chains: selectedChains }) }} className="flex-1 bg-white text-black hover:scale-[1.02] py-2.5 md:py-4 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all">Create Link</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// SUB-COMPONENT: CUSTOMER CHECKOUT PREVIEW (MERCHANT VIEWING IT)
// =============================================================================

const CustomerCheckoutPreview = ({ linkData, onBack }) => (
  <motion.div initial={{ opacity: 0, filter: 'blur(20px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl px-4">
    <button onClick={onBack} className="absolute top-6 md:top-10 left-6 md:left-10 text-white/30 hover:text-white uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-bold transition-colors flex items-center gap-2">
      <X size={14}/> Close Preview
    </button>
    <div className="fusion-blur-shape opacity-50" />
    <div className="relative z-10 flex flex-col items-center w-full max-w-[360px]">
      <div className="mb-6 md:mb-10 text-center w-full">
        <h2 className="text-xs md:text-lg font-bold tracking-tighter italic text-white/50 truncate w-full px-2">bifrost.network/pay/{linkData.name.replace(/\s+/g, '-').toLowerCase()}</h2>
        <p className="text-[7px] md:text-[10px] uppercase tracking-[0.4em] text-white/30 mt-1 md:mt-2">Customer Preview</p>
      </div>
      <BifrostCheckoutWidget 
        productName={linkData.name} 
        priceUsd={linkData.price} 
        availableChains={linkData.chains} 
        onReturnToStore={onBack} 
      />
    </div>
  </motion.div>
);

// =============================================================================
// SUB-COMPONENT: REAL BACKEND KIRA-PAY ENGINE (CHECKOUT WIDGET)
// =============================================================================

const BifrostCheckoutWidget = ({ productName, priceUsd, availableChains = ['Solana', 'Base', 'Eth'], onReturnToStore, isPreviewMode, onPreviewStart }) => {
  const [selectedChain, setSelectedChain] = useState(availableChains[0] || 'Solana');
  const [txState, setTxState] = useState('idle'); 
  const [loadingText, setLoadingText] = useState('');
  const { connected, publicKey, signMessage } = useWallet();

  const getRequiredWallet = (chain) => {
    const evmChains = ['Base', 'Eth', 'Ethereum', 'Arbitrum', 'Polygon'];
    return evmChains.includes(chain) ? 'MetaMask' : 'Phantom';
  };

  const handlePaymentFlow = async () => {
    if (txState !== 'idle') return; 
    setTxState('connecting_wallet');

    // 1. Handle Wallet Connection & Signatures
    if (selectedChain === 'Solana') {
      if (!connected) {
        alert("Please connect your Solana wallet to complete the checkout!");
        setTxState('idle');
        return;
      }
      try {
        const message = new TextEncoder().encode(`Bifrost Secure Checkout\nAuthorize $${priceUsd} for ${productName}`);
        await signMessage(message); 
      } catch (error) {
        console.error("Signature rejected:", error);
        setTxState('idle');
        return;
      }
    } else {
      // THE FIX: REAL EVM WALLET INTEGRATION (MetaMask, Coinbase Wallet, etc.)
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          // 1. Request to connect the EVM wallet
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];

          // 2. Format the message for EVM signature (convert to hex)
          const message = `Bifrost Secure Checkout\nAuthorize $${priceUsd} for ${productName} on ${selectedChain}`;
          const hexMessage = '0x' + message.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');

          // 3. Trigger the REAL MetaMask signature popup!
          await window.ethereum.request({
            method: 'personal_sign',
            params: [hexMessage, account],
          });
        } catch (error) {
          console.error("EVM Signature rejected:", error);
          setTxState('idle'); // They clicked "Cancel" in MetaMask
          return;
        }
      } else {
        alert("No EVM wallet detected! Please install MetaMask to use Base/Ethereum, or switch to Solana.");
        setTxState('idle');
        return;
      }
    }

    // 2. CONNECT TO BACKEND (Professional UI Flow)
    setTxState('processing');
    setLoadingText('Initiating secure payment...');

    try {
      const response = await fetch('/api/kirapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          priceUsd,
          sourceChain: selectedChain,
          destinationChain: 'Solana', 
          merchantWallet: publicKey ? publicKey.toString() : 'mock_merchant_address'
        })
      });

      const data = await response.json();

      if (data.success) {
        setLoadingText('Authenticating intent...');
        setTimeout(() => setLoadingText('Routing across networks...'), 1800);
        setTimeout(() => setLoadingText('Finalizing settlement...'), 3500);
        
        setTimeout(() => {
          setTxState('success');
        }, 5000);
      } else {
        throw new Error("API Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend API");
      setTxState('idle');
    }
  };

  return (
    <div className="w-full glass-card rounded-[24px] md:rounded-[40px] p-5 md:p-8 border-white/10 shadow-2xl relative z-20 mx-auto overflow-hidden min-h-[350px] flex flex-col">
      
      {txState === 'success' ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <CheckCircle2 size={28} className="md:w-8 md:h-8" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold italic mb-1 md:mb-2">Payment Successful</h3>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-widest text-white/40 mb-6 md:mb-8">Secured by KiraPay Protocol</p>
          
          <button onClick={onReturnToStore || (() => setTxState('idle'))} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-[8px] md:text-[10px] uppercase tracking-widest transition-all">
            {onReturnToStore ? "Return to Store" : "Payment Complete"}
          </button>
        </motion.div>

      ) : txState === 'processing' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="relative w-14 h-14 md:w-20 md:h-20 mb-6 md:mb-8">
            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-2 border-purple-500 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="text-purple-400 animate-pulse w-5 h-5 md:w-8 md:h-8" />
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-purple-400">Processing</h3>
          
          <div className="h-8 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] md:tracking-[0.3em]"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

      ) : txState === 'connecting_wallet' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
          <h3 className="text-sm md:text-base font-bold uppercase tracking-widest mb-2">Connecting</h3>
          <p className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Awaiting {getRequiredWallet(selectedChain)} Signature...
          </p>
        </motion.div>

      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="max-w-[140px] md:max-w-[200px]">
              <h3 className="text-base md:text-xl font-bold tracking-tight truncate uppercase italic">{productName}</h3>
              <p className="text-[7px] md:text-[9px] text-white/20 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1 md:mt-2">Powered by KiraPay</p>
            </div>
            <div className="text-xl md:text-3xl font-light tracking-tighter">${priceUsd}</div>
          </div>
          
          <div className="space-y-2 md:space-y-3 mb-auto">
            {availableChains.map(c => {
              const isActive = selectedChain === c;
              return (
                <button key={c} onClick={() => setSelectedChain(c)} className={`w-full flex justify-between items-center p-2.5 md:p-4 rounded-xl md:rounded-2xl border transition-all ${isActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                  <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] ${isActive ? 'text-white' : 'text-white/40'}`}>{c}</span>
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isActive ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-white/10'}`} />
                </button>
              )
            })}
          </div>

          <button 
            onClick={isPreviewMode ? onPreviewStart : handlePaymentFlow} 
            disabled={!isPreviewMode && txState !== 'idle'} 
            className="w-full bg-white text-black py-3 md:py-4 mt-6 rounded-lg md:rounded-2xl font-bold text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isPreviewMode ? "Get Started" : `Pay with ${selectedChain}`}
          </button>
        </motion.div>
      )}
    </div>
  );
};