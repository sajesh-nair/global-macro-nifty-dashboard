"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define schemas for both data structures
interface NiftyStockData {
  ticker: string;
  company_name: string;
  momentum_score: number;
  return_6m: number;
}

interface ETFData {
  ticker: string;
  country_region: string;
  return_2025_2026: number;
}

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'nifty' | 'etf'>('nifty');
  const [stocks, setStocks] = useState<NiftyStockData[]>([]);
  const [etfs, setEtfs] = useState<ETFData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchAllMetrics() {
      try {
        setLoading(true);
        
        // Parallel execution fetching from both tables at once
        const [niftyRes, etfRes] = await Promise.all([
          supabase.from('nifty_momentum_20').select('ticker, company_name, momentum_score, return_6m').order('momentum_score', { ascending: false }),
          supabase.from('etf_performance').select('ticker, country_region, return_2025_2026').order('return_2025_2026', { ascending: false })
        ]);

        if (niftyRes.error) throw niftyRes.error;
        if (etfRes.error) throw etfRes.error;

        if (niftyRes.data) setStocks(niftyRes.data);
        if (etfRes.data) setEtfs(etfRes.data);

      } catch (err) {
        console.error("Error connecting to terminal database partitions:", err);
      } finally {
        setLoading(false);
      }
    }

    if (supabaseUrl && supabaseAnonKey) {
      fetchAllMetrics();
    } else {
      setLoading(false);
    }
  }, []);

  // Filter matrix changes cleanly based on whichever tab is active
  const filteredNifty = stocks.filter(stock => 
    stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEtfs = etfs.filter(etf => 
    etf.country_region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etf.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set grid segmentation target array
  const activeDataset = activeTab === 'nifty' ? filteredNifty : filteredEtfs;
  const itemsPerColumn = Math.ceil(activeDataset.length / 3);
  const columns = [
    activeDataset.slice(0, itemsPerColumn),
    activeDataset.slice(itemsPerColumn, itemsPerColumn * 2),
    activeDataset.slice(itemsPerColumn * 2)
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Terminal Block */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-5 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
              {activeTab === 'nifty' ? 'Nifty Momentum Terminal' : 'GlobalBeta Terminal'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'nifty' 
                ? 'Quantitative Risk-Adjusted Selection Engine Leaders' 
                : 'Global Equity ETFs: 2025-2026 Cumulative Total Returns (US $)'}
            </p>
          </div>
          
          {/* Instant Client Filter Input Box */}
          <div className="mt-4 md:mt-0 w-full md:w-80">
            <input 
              type="text"
              placeholder={activeTab === 'nifty' ? "Filter by Asset Name or Ticker..." : "Filter by Country or Ticker..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex space-x-2 p-1 bg-gray-950/60 rounded-xl border border-gray-800 max-w-md mb-6">
          <button
            onClick={() => { setActiveTab('nifty'); setSearchTerm(""); }}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'nifty' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            🇮🇳 Nifty Momentum Stocks
          </button>
          <button
            onClick={() => { setActiveTab('etf'); setSearchTerm(""); }}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'etf' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg' 
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            🌐 Global ETF Tracker
          </button>
        </div>

        {/* Configuration Alert Banner */}
        {!supabaseUrl && (
          <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 px-4 py-3 rounded-xl mb-6 text-sm">
            <strong>Database configuration missing:</strong> Terminal is disconnected. Link your Supabase credentials in Vercel.
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-20 text-lg animate-pulse">Querying cloud ledger partitions...</div>
        ) : activeDataset.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-md border border-dashed border-gray-800 rounded-xl">
            No active data rows match this search term inside the cloud ledger.
          </div>
        ) : (
          /* Multi-Column Layout Grid rendering columns smoothly */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((colData, colIdx) => (
              <div key={colIdx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cyan-950 text-cyan-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                      <th className="py-3 px-4">{activeTab === 'nifty' ? 'Company Asset' : 'Country/Region'}</th>
                      <th className="py-3 px-4 text-center">Ticker</th>
                      <th className="py-3 px-4 text-right">{activeTab === 'nifty' ? 'M-Score' : '2025-26 %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {colData.map((item: any, itemIdx) => {
                      // Adapt label mapping strings and green logic depending on active dataset structure
                      const nameLabel = activeTab === 'nifty' ? item.company_name : item.country_region;
                      const displayMetric = activeTab === 'nifty' ? item.momentum_score : item.return_2025_2026;
                      const isPositive = displayMetric >= 0;
                      
                      return (
                        <tr key={item.ticker + itemIdx} className="hover:bg-gray-800/50 transition">
                          <td className="py-2.5 px-4 font-medium text-gray-300 max-w-[180px] truncate" title={nameLabel}>
                            {nameLabel}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-gray-400 text-xs font-bold">{item.ticker}</td>
                          <td className={`py-2.5 px-4 text-right font-bold font-mono ${
                            isPositive ? 'text-green-400 bg-green-950/20' : 'text-rose-400 bg-rose-950/20'
                          }`}>
                            {activeTab === 'nifty' 
                              ? displayMetric.toFixed(2) 
                              : (isPositive ? `+${displayMetric}%` : `${displayMetric}%`)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Attribution Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500 border-t border-slate-800/60 pt-6 pb-8 w-full">
          <p>
            Built and Maintained by <span className="text-cyan-400 font-medium">Sajesh Nair</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Automated Financial Analysis Portfolio • Powered by Next.js, Supabase, Railway & Vercel
          </p>
        </footer>

      </div>
    </div>
  );
}