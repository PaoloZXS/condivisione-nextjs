'use client';

import PageLayout from '@/app/components/PageLayout';
import { useState } from 'react';

export default function ClientiPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageLayout title="Clienti" icon="👥">
      <div className="space-y-6">
        {/* Search and Add */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cerca cliente per nome, email o partita IVA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition whitespace-nowrap">
              + Nuovo Cliente
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
                    C{i}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cliente {i}</h3>
                  <p className="text-sm text-gray-500 mt-1">email@example.com</p>
                  <p className="text-sm text-gray-500">P.IVA: 12345678901</p>
                </div>
                <div className="text-gray-400">⋯</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="flex-1 text-blue-600 hover:text-blue-700 font-medium text-sm">Visualizza</button>
                  <button className="flex-1 text-gray-600 hover:text-gray-700 font-medium text-sm">Modifica</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="text-center py-12">
          <p className="text-gray-500">Caricamento clienti dal database in corso...</p>
        </div>
      </div>
    </PageLayout>
  );
}
