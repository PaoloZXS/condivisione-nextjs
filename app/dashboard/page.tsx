'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  azienda: string;
  tecnico: string;
  typeutente: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se l'utente è autenticato
    const storedUser = localStorage.getItem('utenteLoggato');
    
    if (!storedUser) {
      // Reindirizza al login se non autenticato
      window.location.href = '/login';
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Errore parsing utente:', error);
      window.location.href = '/login';
    }
  }, [router]);

  const handleLogout = () => {
    // Cancella i dati di sessione
    localStorage.removeItem('utenteLoggato');
    localStorage.removeItem('authToken');
    
    // Reindirizza al login
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Condivisione</span>Dati
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.nome} {user.cognome}
                </p>
                <p className="text-xs text-gray-500">{user.typeutente}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto, {user.nome}! 👋
          </h2>
          <p className="text-gray-600">
            Questo è il nuovo sistema CondivisioneDati creato con Next.js
          </p>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Nome</p>
            <p className="text-xl font-semibold text-gray-900">{user.nome}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Cognome</p>
            <p className="text-xl font-semibold text-gray-900">{user.cognome}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Azienda</p>
            <p className="text-xl font-semibold text-gray-900">{user.azienda}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Tipo Utente</p>
            <p className="text-xl font-semibold text-gray-900">{user.typeutente}</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon="📋" 
            title="Operazioni" 
            description="Gestisci le tue operazioni e interventi"
          />
          <FeatureCard 
            icon="👥" 
            title="Clienti" 
            description="Visualizza e gestisci i clienti"
          />
          <FeatureCard 
            icon="📅" 
            title="Calendario" 
            description="Pianifica i tuoi interventi"
          />
          <FeatureCard 
            icon="📈" 
            title="Report" 
            description="Visualizza i tuoi report e statistiche"
          />
          <FeatureCard 
            icon="⚙️" 
            title="Impostazioni" 
            description="Configura il tuo profilo"
          />
          <FeatureCard 
            icon="💬" 
            title="Supporto" 
            description="Contatta il team di supporto"
          />
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 Novità in questa versione
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Nuova interfaccia moderna e intuitiva</li>
            <li>Migliori performance e velocità di caricamento</li>
            <li>Supporto per dispositivi mobile</li>
            <li>Sistema di autenticazione sicuro con JWT</li>
            <li>Integration con database PostgreSQL (producti)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
