'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

interface PageLayoutProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, icon, children }: PageLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Verifica se l'utente è autenticato
    const storedUser = localStorage.getItem('utenteLoggato');
    
    if (!storedUser) {
      // Se non autenticato, reindirizza una sola volta
      setRedirecting(true);
      setTimeout(() => {
        router.push('/login');
      }, 0);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsChecking(false);
    } catch (error) {
      console.error('Errore parsing utente:', error);
      setRedirecting(true);
      setTimeout(() => {
        router.push('/login');
      }, 0);
    }
  }, [router]);

  // Se sta reindirizzando, mostra schermata di caricamento
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  // Se ancora sta controllando o non ha utente, mostra loading
  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-16 lg:top-0 z-39">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-xs text-gray-500">Sistema CondivisioneDati</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.nome} {user.cognome}
                  </p>
                  <p className="text-xs text-gray-500">{user.typeutente}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
