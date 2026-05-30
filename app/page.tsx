"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Updated to perfectly match your live nifty_momentum_20 database schema columns
interface NiftyStockData {
  ticker: string;
  company_name: string;
  momentum_score: number;
  return_6m: number;
}

// Initialize the Supabase client using client-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [stocks, setStocks] = useState<NiftyStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchLatestMetrics() {
      try {
        setLoading(true);
        
        // Pointing directly to your fresh Nifty momentum database ledger table
        const { data, error } = await supabase
          .from('nifty_momentum_20')
          .select('ticker, company_name, momentum_score, return_6m')
          .order('momentum_score', { ascending: false });

        if (error) throw error;

        if (data) {
          setStocks(data);
        }
      } catch (err) {
        console.error("Error connecting to terminal database:", err);
      } finally {
        setLoading(false);
      }
    }

    // Only attempt the network request if our environment strings are configured
    if (supabaseUrl && supabaseAnonKey) {
      fetchLatestMetrics();
    } else {
      setLoading(false);
    }
  }, []);

  // Updated live filter query matrix to track by ticker symbol or corporate entity name
  const filteredStocks = stocks.filter(stock => 
    stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split results cleanly across 3 distinct viewport matrix columns
  const itemsPerColumn = Math.ceil(filteredStocks.length / 3);
  const columns = [
    filteredStocks.slice(0, itemsPerColumn),
    filteredStocks.slice(itemsPerColumn, itemsPerColumn * 2),
    filteredStocks.slice(itemsPerColumn * 2)
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Terminal Block */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-5 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400">Nifty Momentum Terminal</h1>
            <p className="text-sm text-gray-400 mt-1">Quantitative Risk-Adjusted Selection Engine Leaders</p>
          </div>
          
          {/* Instant Client Filter Input Box */}
          <div className="mt-4 md:mt-0 w-full md:w-80">
            <input 
              type="text"
              placeholder="Filter by Asset Name or Ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Configuration Warning Alert Banner */}
        {!supabaseUrl && (
          <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 px-4 py-3 rounded-xl mb-6 text-sm">
            <strong>Database configuration missing:</strong> Dashboard is currently disconnected. Please link your Supabase environment variables in Vercel to unlock real-time live polling.
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-20 text-lg animate-pulse">Querying cloud ledger data...</div>
        ) : stocks.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-md border border-dashed border-gray-800 rounded-xl">
            No data records currently inside the cloud matrix. Trigger the backend sync script to populate tables.
          </div>
        ) : (
          /* Responsive Multi-Column Layout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((colData, colIdx) => (
              <div key={colIdx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cyan-950 text-cyan-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                      <th className="py-3 px-4">Company Asset</th>
                      <th className="py-3 px-4 text-center">Ticker</th>
                      <th className="py-3 px-4 text-right">M-Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {colData.map((stock) => {
                      const isPositive = stock.momentum_score >= 0;
                      return (
                        <tr key={stock.ticker} className="hover:bg-gray-800/50 transition">
                          <td className="py-2.5 px-4 font-medium text-gray-300 max-w-[180px] truncate" title={stock.company_name}>
                            {stock.company_name}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-gray-400 text-xs font-bold">{stock.ticker}</td>
                          <td className={`py-2.5 px-4 text-right font-bold font-mono ${
                            isPositive ? 'text-green-400 bg-green-950/20' : 'text-rose-400 bg-rose-950/20'
                          }`}>
                            {stock.momentum_score.toFixed(2)}
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

        {/* Professional Developer Attribution Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500 border-t border-slate-800/60 pt-6 pb-8 w-full">
          <p>
            Built and Maintained by <span className="text-cyan-400 font-medium">Sajesh Nair</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Automated Quantitative Stock Screening Pipeline • Powered by Next.js, Supabase, Railway & Vercel
          </p>
        </footer>

      </div>
    </div>
  );
}