'use client';

import PageLayout from '@/app/components/PageLayout';

export default function PlanningPage() {
  return (
    <PageLayout title="Planning" icon="📅">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  📅
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Elemento {item}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Contenuto della pianificazione in arrivo...
                </p>
                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    In preparazione
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          <strong>ℹ️ Informazione:</strong> Questa sezione mostrerà i dati di planning una volta integrati dal database.
        </p>
      </div>
    </PageLayout>
  );
}
