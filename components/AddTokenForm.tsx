'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Token } from './Portfolio';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AddTokenFormProps {
  onAdd: (token: Token) => void;
  onClose: () => void;
}

interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
  large?: string;
}

export default function AddTokenForm({ onAdd, onClose }: AddTokenFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [searchResults, setSearchResults] = useState<CoinGeckoToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<CoinGeckoToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const priceCache = useRef<{[key: string]: {price: number; change: number; timestamp: number}}>({});

  // Function to check if cached price is still valid (5 minutes)
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < 5 * 60 * 1000;
  };

  // Function to get price with caching
  const getTokenPrice = async (tokenId: string): Promise<{price: number; change: number}> => {
    // Check cache first
    const cached = priceCache.current[tokenId];
    if (cached && isCacheValid(cached.timestamp)) {
      return { price: cached.price, change: cached.change };
    }

    // If not in cache or expired, fetch new price
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit delay
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoBagz Portfolio Tracker'
          }
        }
      );

      const data = response.data[tokenId];
      if (!data) {
        throw new Error('No price data available');
      }

      // Cache the result
      const result = { price: data.usd, change: data.usd_24h_change };
      priceCache.current[tokenId] = { ...result, timestamp: Date.now() };
      return result;
    } catch (error: any) {
      if (error.response?.status === 429) {
        // If rate limited but we have cached data, use it even if expired
        if (cached) {
          return { price: cached.price, change: cached.change };
        }
        throw new Error('Rate limit reached. Please wait a minute before adding another token.');
      }
      throw error;
    }
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedToken) {
      amountInputRef.current?.focus();
    }
  }, [selectedToken]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTokens(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchTokens = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/search?query=${query}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoBagz Portfolio Tracker'
          }
        }
      );
      setSearchResults(response.data.coins.slice(0, 10));
    } catch (error: any) {
      console.error('Error searching tokens:', error);
      if (error.response?.status === 429) {
        alert('Rate limit reached. Please wait a minute before searching again.');
      } else {
        alert('Failed to search tokens. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedToken(null);
  };

  const handleSelectToken = (token: CoinGeckoToken) => {
    setSelectedToken(token);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken || !amount || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const { price, change } = await getTokenPrice(selectedToken.id);

      const newToken = {
        id: selectedToken.id,
        symbol: selectedToken.symbol.toUpperCase(),
        name: selectedToken.name,
        amount: parsedAmount,
        currentPrice: price,
        priceChangePercentage24h: change,
        value: price * parsedAmount,
        image: selectedToken.large || selectedToken.thumb
      };

      onAdd(newToken);
      onClose();
    } catch (error: any) {
      console.error('Error adding token:', error);
      setError(error.message || 'Failed to add token. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Token</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedToken ? (
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Token
            </label>
            <input
              ref={searchInputRef}
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter token name or symbol"
            />

            {loading && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <ul className="mt-2 max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
                {searchResults.map((token) => (
                  <li
                    key={token.id}
                    onClick={() => handleSelectToken(token)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <img
                      src={token.thumb}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {token.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {token.symbol.toUpperCase()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={selectedToken.thumb}
                alt={selectedToken.symbol}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedToken.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedToken.symbol.toUpperCase()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedToken(null)}
                className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                ref={amountInputRef}
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter amount"
                step="any"
                min="0"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          {selectedToken && (
            <button
              type="submit"
              disabled={!amount || submitting || parseFloat(amount) <= 0}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-md hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                'Add Token'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
