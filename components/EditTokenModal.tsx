'use client';

import { useRef, useEffect } from 'react';
import { Token } from './Portfolio';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface EditTokenModalProps {
  token: Token;
  onEdit: (id: string, newAmount: number) => void;
  onClose: () => void;
}

export default function EditTokenModal({ token, onEdit, onClose }: EditTokenModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Select all text when modal opens
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(inputRef.current?.value || '0');
    if (newAmount > 0) {
      onEdit(token.id, newAmount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Token Amount</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <img
              src={token.image}
              alt={token.symbol}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {token.name || token.symbol}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {token.symbol}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <input
              ref={inputRef}
              type="number"
              id="amount"
              defaultValue={token.amount}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount"
              step="any"
              min="0"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-md hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
