'use client';

import { Token } from './Portfolio';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface PortfolioSummaryProps {
  tokens: Token[];
}

export default function PortfolioSummary({ tokens }: PortfolioSummaryProps) {
  const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
  const totalChange24h = tokens.reduce((sum, token) => {
    if (token.value && token.priceChangePercentage24h) {
      return sum + (token.value * token.priceChangePercentage24h / 100);
    }
    return sum;
  }, 0);
  const changePercentage = (totalChange24h / (totalValue - totalChange24h)) * 100;

  // Sort tokens by value (highest first) and take top 6
  const topTokens = [...tokens]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Portfolio Summary</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">24h Change</div>
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl sm:text-3xl font-bold ${
              totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {totalChange24h >= 0 ? '+' : ''}
              ${Math.abs(totalChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-medium ${
              changePercentage >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              ({changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Assets ({tokens.length} total)</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {topTokens.map(token => (
            <div key={token.id} className="flex items-center gap-2">
              {token.image && (
                <img 
                  src={token.image} 
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {token.symbol.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  ${token.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
