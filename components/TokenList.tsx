'use client';

import { useState } from 'react';
import { Token } from './Portfolio';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon } from '@heroicons/react/24/solid';

interface TokenListProps {
  tokens: Token[];
  onRemove: (id: string) => void;
  onEdit: (token: Token) => void;
  loading: boolean;
}

type SortField = 'name' | 'amount' | 'price' | 'value' | 'change';
type SortDirection = 'asc' | 'desc';

export default function TokenList({ tokens, onRemove, onEdit, loading }: TokenListProps) {
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

  const renderSortableHeader = (field: SortField, label: string) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon field={field} />
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {renderSortableHeader('name', 'Token')}
              {renderSortableHeader('amount', 'Amount')}
              {renderSortableHeader('price', 'Price')}
              {renderSortableHeader('change', '24h Change')}
              {renderSortableHeader('value', 'Value')}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTokens.map((token) => (
              <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {token.image && (
                      <img 
                        src={token.image} 
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.name || token.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{token.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-white">
                      ${token.currentPrice?.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
                  ) : (
                    <div className={`text-sm font-medium ${
                      (token.priceChangePercentage24h || 0) >= 0 
                        ? 'text-green-600 dark:text-green-500' 
                        : 'text-red-600 dark:text-red-500'
                    }`}>
                      {token.priceChangePercentage24h?.toFixed(2)}%
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-white">
                      ${token.value?.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(token)}
                      className="text-blue-600 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                      title="Edit amount"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onRemove(token.id)}
                      className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                      title="Remove token"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
