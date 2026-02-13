'use client';

import PageLayout from '@/app/components/PageLayout';

export default function ProdottiPage() {
  return (
    <PageLayout title="Prodotti" icon="📦">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtri</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Tutte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilità</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Tutti</option>
                <option>In Stock</option>
                <option>Esaurito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Tutti</option>
                <option>0 - 100 €</option>
                <option>100 - 500 €</option>
                <option>&gt; 500 €</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Filtra
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-48 flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Prodotto {i}</h3>
                <p className="text-sm text-gray-500 mt-1">Codice: PROD{i}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">€ {(i * 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Stock: 0</p>
                  </div>
                  <button className="bg-blue-100 text-blue-600 px-3 py-2 rounded hover:bg-blue-200 transition text-sm font-medium">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
