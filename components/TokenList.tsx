'use client';

import { useState } from 'react';
import { Token } from './Portfolio';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon } from '@heroicons/react/24/solid';

interface TokenListProps {
  tokens: Token[];
  onDelete: (id: string) => void;
  onEdit: (token: Token) => void;
  loading: boolean;
}

type SortField = 'name' | 'amount' | 'price' | 'value' | 'change';
type SortDirection = 'asc' | 'desc';

export default function TokenList({ tokens, onDelete, onEdit, loading }: TokenListProps) {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  if (tokens.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No tokens added yet. Click "Add Token" to get started.
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline-block ml-1" />
    );
  };

  const filteredTokens = tokens.filter(token => {
    const searchLower = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(searchLower) ||
      (token.name?.toLowerCase() || '').includes(searchLower)
    );
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return multiplier * ((a.name || a.symbol).localeCompare(b.name || b.symbol));
      case 'amount':
        return multiplier * (a.amount - b.amount);
      case 'price':
        return multiplier * ((a.currentPrice || 0) - (b.currentPrice || 0));
      case 'value':
        return multiplier * ((a.value || 0) - (b.value || 0));
      case 'change':
        return multiplier * ((a.priceChangePercentage24h || 0) - (b.priceChangePercentage24h || 0));
      default:
        return 0;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTokens.map((token) => (
        <div
          key={token.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 relative group"
        >
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(token)}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(token.id)}
              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-3">
            {token.image && (
              <img
                src={token.image}
                alt={token.name || token.symbol}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {token.name || token.symbol.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {token.symbol.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {token.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </span>
            </div>

            {token.currentPrice && (
              <>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${token.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Value:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${token.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {token.priceChangePercentage24h && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500 dark:text-gray-400">24h:</span>
                    <span className={`font-medium ${
                      token.priceChangePercentage24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {token.priceChangePercentage24h >= 0 ? '+' : ''}
                      {token.priceChangePercentage24h.toFixed(2)}%
                    </span>
                  </div>
                )}
              </>
            )}

            {token.error && (
              <p className="text-sm text-red-500 mt-2">{token.error}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
