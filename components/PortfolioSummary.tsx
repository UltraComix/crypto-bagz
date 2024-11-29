'use client';

import { Token } from './Portfolio';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface PortfolioSummaryProps {
  tokens: Token[];
  loading: boolean;
}

export default function PortfolioSummary({ tokens, loading }: PortfolioSummaryProps) {
  const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
  const totalChange24h = tokens.reduce((sum, token) => {
    const tokenValue = token.value || 0;
    const changePercent = token.priceChangePercentage24h || 0;
    return sum + (tokenValue * changePercent / 100);
  }, 0);
  
  const changePercent24h = (totalChange24h / (totalValue - totalChange24h)) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg shadow-lg p-6 md:p-8 text-white">
        <h2 className="text-lg md:text-xl font-semibold mb-2 opacity-90">Total Value</h2>
        <div className="text-2xl md:text-4xl font-bold">
          {loading ? (
            <div className="animate-pulse bg-white bg-opacity-20 h-10 w-48 rounded-lg"></div>
          ) : (
            `$${totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">24h Performance</h2>
        {loading ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-48 rounded-lg"></div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`text-2xl md:text-4xl font-bold ${
                totalChange24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              }`}>
                ${Math.abs(totalChange24h).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              {totalChange24h >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600 dark:text-red-500" />
              )}
            </div>
            <div className={`text-sm md:text-base font-medium ${
              changePercent24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {changePercent24h >= 0 ? '+' : ''}{changePercent24h.toFixed(2)}% (24h)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
