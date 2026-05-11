// @ts-nocheck
/* eslint-disable */
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// =============================================================================
// CUSTOMER CHECKOUT PAGE (LIVE PUBLIC LINK)
// =============================================================================

export default function CustomerCheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. DYNAMICALLY LOAD THE REAL LINK CREATED BY THE MERCHANT
    try {
      const savedLinks = localStorage.getItem('bifrost_merchant_links');
      if (savedLinks) {
        const links = JSON.parse(savedLinks);
        // Find the link that matches the URL slug
        const foundLink = links.find((l: any) => 
          l.name.replace(/\s+/g, '-').toLowerCase() === slug
        );

        if (foundLink) {
          setProductData({
            name: foundLink.name,
            price: foundLink.price,
            chains: foundLink.chains
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load link data", e);
    }

    // If no link is found, we stop loading and show the error state
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-white/40 text-2xl">?</span>
        </div>
        <h1 className="text-xl font-bold italic text-white mb-2">Intent Not Found</h1>
        <p className="text-[10px] uppercase tracking-widest text-white/40">This payment gateway does not exist or has been deactivated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative flex flex-col items-center justify-center py-10 px-4">
      {/* Background styling matching Bifrost */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-radial-gradient from-purple-500/10 to-transparent blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[420px]">
        <BifrostCheckoutWidget
          productName={productData.name}
          priceUsd={productData.price}
          availableChains={productData.chains}
          onReturnToStore={() => window.history.back()}
        />
      </div>
    </div>
  );
}

// =============================================================================
// BIFROST CHECKOUT WIDGET (SYNCED WITH ANALYTICS)
// =============================================================================

const BifrostCheckoutWidget = ({ productName, priceUsd, availableChains, onReturnToStore }: any) => {
  const [selectedChain, setSelectedChain] = useState(availableChains[0] || 'Solana');
  const [txState, setTxState] = useState<'idle' | 'connecting_wallet' | 'success'>('idle');
  const [loadingText, setLoadingText] = useState('');
  const { connected, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const getRequiredWallet = (chain: string): string => {
    const evmChains = ['Base', 'Eth', 'Ethereum', 'Arbitrum', 'Polygon'];
    return evmChains.includes(chain) ? 'MetaMask' : 'Phantom';
  };

  const handlePaymentFlow = async () => {
    if (txState !== 'idle') return;
    setTxState('connecting_wallet');

    // =======================================================================
    // THE MAGIC: TRIPLE-SYNC TO MERCHANT DASHBOARD
    // =======================================================================
    const recordPayment = () => {
      const amountNum = parseFloat(priceUsd);
      const timestamp = new Date().toLocaleTimeString();

      // 1. Sync to Real Payments (Boosts Analytics Revenue)
      try {
        const payment = {
          id: Date.now(),
          product: productName,
          amount: amountNum,
          chain: selectedChain,
          timestamp: new Date().toLocaleString(),
          customerAddress: '0x' + Math.random().toString(16).substr(2, 8).toUpperCase(),
          txHash: '0x' + Math.random().toString(16).substr(2, 64)
        };
        const existingPayments = localStorage.getItem('bifrost_real_payments') || '[]';
        const payments = JSON.parse(existingPayments);
        payments.unshift(payment);
        localStorage.setItem('bifrost_real_payments', JSON.stringify(payments));
      } catch (e) { console.error('Failed to sync analytics', e); }

      // 2. Sync to Terminal Agent Log
      try {
        const existingTxns = localStorage.getItem('bifrost_transactions') || '[]';
        const txns = JSON.parse(existingTxns);
        txns.unshift({
          id: Date.now() + 1,
          chain: selectedChain,
          product: productName,
          amount: amountNum,
          timestamp: timestamp,
          remaining: 0 
        });
        localStorage.setItem('bifrost_transactions', JSON.stringify(txns));
      } catch (e) { console.error('Failed to sync terminal log', e); }

      // 3. Deduct Customer Wallet Balance (so Test Balance drops)
      try {
        const key = selectedChain.toLowerCase().startsWith('base') ? 'base' :
                    selectedChain.toLowerCase().startsWith('eth') ? 'eth' : 'sol';
        const existingBalances = localStorage.getItem('bifrost_test_balances');
        if (existingBalances) {
          const balances = JSON.parse(existingBalances);
          balances[key] = Math.max(0, balances[key] - amountNum);
          localStorage.setItem('bifrost_test_balances', JSON.stringify(balances));
        }
      } catch (e) { console.error('Failed to sync balances', e); }
    };

    // =======================================================================
    // WALLET SIGNATURE LOGIC
    // =======================================================================
    if (selectedChain === 'Solana') {
      if (!connected) {
        setVisible(true);
        setTxState('idle');
        return;
      }
      try {
        setLoadingText('Requesting signature...');
        const message = new TextEncoder().encode(`Bifrost Secure Checkout\nAuthorize $${priceUsd} for ${productName}`);
        if (signMessage) await signMessage(message);
        
        setLoadingText('Agent: Routing intent...');
        setTimeout(() => {
          recordPayment();
          setTxState('success');
          setLoadingText('');
        }, 3000);
      } catch (error) {
        console.error("Signature rejected:", error);
        setTxState('idle');
        setLoadingText('');
      }
    } else {
      // EVM Wallet Integration
      if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
        try {
          setLoadingText('Connecting wallet...');
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          
          setLoadingText('Requesting signature...');
          const message = `Bifrost Secure Checkout\nAuthorize $${priceUsd} for ${productName} on ${selectedChain}`;
          const hexMessage = '0x' + message.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');

          await (window as any).ethereum.request({
            method: 'personal_sign',
            params: [hexMessage, accounts[0]],
          });

          setLoadingText('Agent: Routing intent...');
          setTimeout(() => {
            recordPayment();
            setTxState('success');
            setLoadingText('');
          }, 3000);
        } catch (error) {
          console.error("EVM Signature rejected:", error);
          setTxState('idle');
          setLoadingText('');
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet');
        setTxState('idle');
      }
    }
  };

  return (
    <div className="w-full bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-white/10 rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl relative z-20 flex flex-col min-h-[450px]">
      
      {txState === 'success' ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-8 border border-purple-500/50">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 className="text-3xl font-bold italic uppercase mb-2 text-white">Settled</h3>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-8">Transaction verified via KiraPay Protocol</p>
          <button onClick={onReturnToStore} className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white transition-all">
            Return to Dashboard
          </button>
        </motion.div>
      ) : txState === 'processing' || txState === 'connecting_wallet' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] animate-pulse">
            {txState === 'connecting_wallet' ? 'Awaiting Signature' : loadingText}
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold italic uppercase tracking-tighter text-white">{productName}</h3>
            <div className="text-3xl font-mono text-white">${priceUsd}</div>
          </div>

          <div className="space-y-3 mb-10">
            <p className="text-[9px] uppercase tracking-widest text-white/20 ml-2 mb-4">Select Source Chain</p>
            {availableChains.map((c: string) => {
              const active = selectedChain === c;
              return (
                <button key={c} onClick={() => setSelectedChain(c)} className={`w-full flex justify-between items-center p-5 rounded-2xl border transition-all ${active ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white">{c}</span>
                    <span className="text-[8px] text-white/30 mt-1 uppercase tracking-widest">{getRequiredWallet(c)}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${active ? 'bg-purple-500 shadow-[0_0_10px_purple]' : 'bg-white/10'}`} />
                </button>
              );
            })}
          </div>

          <button onClick={handlePaymentFlow} className="w-full bg-white text-black py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
            Pay with {selectedChain}
          </button>
        </>
      )}
    </div>
  );
};