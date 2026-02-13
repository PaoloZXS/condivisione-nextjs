'use client';

import PageLayout from '@/app/components/PageLayout';

export default function ImmaginiPage() {
  return (
    <PageLayout title="Immagini" icon="🖼️">
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carica Nuove Immagini</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-gray-600 font-medium">Trascina le immagini qui o</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold mt-2">clicca per selezionare</button>
            <p className="text-sm text-gray-500 mt-4">Formati supportati: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Tutte</option>
                <option>Prodotti</option>
                <option>Clienti</option>
                <option>Contratti</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Filtra
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Galleria Immagini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative group cursor-pointer">
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  <span className="text-5xl">🖼️</span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">👁️</button>
                  <button className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">🗑️</button>
                </div>
                <p className="mt-2 text-sm text-gray-600">Immagine {i}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
