'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/app/components/PageLayout';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Controlla localStorage solo nel browser
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      const storedUser = localStorage.getItem('utenteLoggato');
      
      if (!storedUser) {
        // Reindirizza al login con window.location per evitare problemi
        window.location.href = '/login';
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore parsing utente:', error);
        window.location.href = '/login';
      }
    };

    // Esegui il check subito
    checkAuth();

    // Fallback: se dopo 2 secondi non hai utente, reindirizza forzatamente
    const timeout = setTimeout(() => {
      if (!user && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [user]);

  // Se sta ancora caricando, mostra loading
  if (isLoading) {
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
    <PageLayout title="Dashboard" icon="📊">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <FeatureCard 
            icon="📊" 
            title="Dashboard" 
            description="Visualizza un riepilogo delle tue attività"
          />
          <FeatureCard 
            icon="👥" 
            title="Clienti" 
            description="Visualizza e gestisci i clienti"
          />
          <FeatureCard 
            icon="📅" 
            title="Calendar" 
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
            <li>Menu di navigazione con 9 sezioni principali</li>
          </ul>
        </div>
    </PageLayout>
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
