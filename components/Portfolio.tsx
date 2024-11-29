'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import AddTokenForm from './AddTokenForm';
import TokenList from './TokenList';
import PortfolioSummary from './PortfolioSummary';
import EditTokenModal from './EditTokenModal';
import { useTheme } from '../context/ThemeContext';

export interface Token {
  id: string;
  symbol: string;
  name?: string;
  amount: number;
  currentPrice?: number;
  priceChangePercentage24h?: number;
  value?: number;
  image?: string;
  error?: string | null;
}

export default function Portfolio() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showAddToken, setShowAddToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenToEdit, setTokenToEdit] = useState<Token | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const savedTokens = localStorage.getItem('portfolio');
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
      } catch (e) {
        console.error('Error parsing saved tokens:', e);
        setError('Error loading saved portfolio');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(tokens));
  }, [tokens]);

  const updatePrices = async () => {
    if (tokens.length === 0) return;
    
    setLoading(true);
    try {
      // Add longer delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

      const ids = tokens.map(token => token.id).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoBagz Portfolio Tracker'
          }
        }
      );
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      setTokens(currentTokens => 
        currentTokens.map(token => {
          const data = response.data[token.id];
          if (!data) {
            console.warn(`No price data found for ${token.id}`);
            return {
              ...token,
              error: 'Price data unavailable'
            };
          }
          
          return {
            ...token,
            currentPrice: data.usd,
            priceChangePercentage24h: data.usd_24h_change,
            value: data.usd * token.amount,
            error: undefined
          };
        })
      );
    } catch (error: any) {
      console.error('Error updating prices:', error);
      if (error.response?.status === 429) {
        setError('Rate limit reached. Prices will update in 60 seconds.');
        // Rate limit hit - try again in 60 seconds
        setTimeout(() => {
          setError(null);
          updatePrices();
        }, 60000);
      } else {
        setError('Failed to update prices. Will retry soon.');
        // For other errors, retry in 30 seconds
        setTimeout(() => {
          setError(null);
          updatePrices();
        }, 30000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePrices();
    // Update prices every 5 minutes instead of 3 minutes to avoid rate limits
    const interval = setInterval(updatePrices, 300000);
    return () => clearInterval(interval);
  }, [tokens.length]);

  const addToken = (newToken: Token) => {
    // Check if token already exists
    const existingToken = tokens.find(token => token.id === newToken.id);
    if (existingToken) {
      // Update the amount if token exists
      setTokens(tokens.map(token => 
        token.id === newToken.id 
          ? { ...token, amount: token.amount + newToken.amount }
          : token
      ));
    } else {
      // Add new token if it doesn't exist
      setTokens([...tokens, newToken]);
    }
    setShowAddToken(false);
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  const editToken = (id: string, newAmount: number) => {
    setTokens(tokens.map(token =>
      token.id === id
        ? { ...token, amount: newAmount, value: (token.currentPrice || 0) * newAmount }
        : token
    ));
  };

  const handleExport = () => {
    const portfolioData = {
      tokens,
      exportDate: new Date().toISOString(),
      totalValue: tokens.reduce((sum, token) => sum + (token.value || 0), 0),
    };

    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-bagz-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <header className="flex flex-col gap-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Crypto Bagz Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-transparent bg-clip-text">
              Crypto Bagz
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
              Track your crypto assets in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-none inline-flex items-center px-2 py-2 sm:px-4 sm:py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <SunIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleExport}
              className="flex-none inline-flex items-center px-2 py-2 sm:px-4 sm:py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
          <button
            onClick={() => setShowAddToken(true)}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Token</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      <PortfolioSummary tokens={tokens} />
      <TokenList 
        tokens={tokens} 
        onDelete={removeToken} 
        onEdit={token => {
          setTokenToEdit(token);
          setShowEditModal(true);
        }}
        loading={loading} 
      />
      
      {showAddToken && (
        <AddTokenForm onClose={() => setShowAddToken(false)} onAdd={addToken} />
      )}

      {tokenToEdit && (
        <EditTokenModal
          token={tokenToEdit}
          onEdit={editToken}
          onClose={() => setTokenToEdit(null)}
        />
      )}
    </div>
  );
}
