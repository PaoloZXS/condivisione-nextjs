'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Funzioni utility per localStorage e cookies
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const eraseCookie = (name: string) => {
  setCookie(name, '', -1);
};

const cryptaData = (data: string): string => {
  // Semplice encoding base64 per il demo
  // In produzione, usare una libreria di crittografia vera
  return btoa(data);
};

const decryptaData = (data: string): string => {
  try {
    return atob(data);
  } catch {
    return '';
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Carica email e password dal cookie se presenti
  useEffect(() => {
    const savedEmail = getCookie('CHKULG');
    const savedPassword = getCookie('CHKPLG');
    if (savedEmail) setEmail(decryptaData(savedEmail));
    if (savedPassword) setPassword(decryptaData(savedPassword));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validazione
      if (!email.trim() || !password.trim()) {
        setError('Email e password sono obbligatori');
        setLoading(false);
        return;
      }

      // Chiama l'API di login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.id || data.id === 0) {
        setError(data.error || 'Credenziali non valide');
        setLoading(false);
        return;
      }

      // Gestisci il cookies se "Ricordami" è selezionato
      if (rememberMe) {
        setCookie('CHKULG', cryptaData(email), 10);
        setCookie('CHKPLG', cryptaData(password), 10);
      } else {
        eraseCookie('CHKULG');
        eraseCookie('CHKPLG');
      }

      // Salva l'utente nel localStorage
      localStorage.setItem('utenteLoggato', JSON.stringify(data));
      localStorage.setItem('authToken', data.token);

      // Mostra messaggio di successo
      setSuccess(true);
      setError('');
      setLoading(false);

      // Reindirizza alla dashboard dopo 2 secondi
      console.log('Login riuscito, dati salvati:', data);
      setTimeout(() => {
        console.log('Reindirizzamento a /dashboard');
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      console.error('Errore login:', err);
      setError('Errore durante il login. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!recoveryEmail.trim()) {
        setError('Email obbligatoria');
        setLoading(false);
        return;
      }

      // Chiama l'API di recovery password
      const response = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });

      if (response.ok) {
        setShowRecovery(false);
        setRecoveryEmail('');
        setError('Email di recupero inviata con successo');
      } else {
        setError('Errore durante il recupero della password');
      }
    } catch (err) {
      console.error('Errore recovery:', err);
      setError('Errore durante il recupero. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">Condivisione</span>Dati
            </h1>
            <p className="text-gray-500 mt-2">Sistema di gestione aziendale</p>
          </div>

          {/* Success/Error Message */}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-700 text-sm font-medium animate-pulse">
              ✓ Login effettuato con successo! Reindirizzamento in corso...
            </div>
          )}

          {error && !success && (
            <div className="mb-4 p-3 rounded text-sm font-medium bg-red-100 text-red-700">
              ✗ {error}
            </div>
          )}

          {!showRecovery ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Ricordami su questo dispositivo
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                {loading ? 'Accesso in corso...' : 'Login'}
              </button>

              <hr className="my-4" />

              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                Password dimenticata
              </button>
            </form>
          ) : (
            /* Recovery Form */
            <form onSubmit={handleRecovery} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Recupera password</h2>
                <p className="text-sm text-gray-600">
                  Inserisci la tua email per recuperare la password
                </p>
              </div>

              <div>
                <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="recovery-email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                {loading ? 'Invio in corso...' : 'Recupera password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRecovery(false);
                  setRecoveryEmail('');
                  setError('');
                }}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                Torna al login
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white text-xs mt-4">
          © 2026 CondivisioneDati - Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}
