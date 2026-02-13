'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { label: 'Planning', href: '/dashboard/planning', icon: '📅' },
    { label: 'Operazioni', href: '/dashboard/operazioni', icon: '📋' },
    { label: 'Operazioni da Firmare', href: '/dashboard/operazioni-firma', icon: '📝' },
    { label: 'Clienti', href: '/dashboard/clienti', icon: '👥' },
    { label: 'Contratti', href: '/dashboard/contratti', icon: '📜' },
    { label: 'Prodotti', href: '/dashboard/prodotti', icon: '📦' },
    { label: 'Immagini', href: '/dashboard/immagini', icon: '🖼️' },
    { label: 'Carnet', href: '/dashboard/carnet', icon: '🎫' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex-col border-r border-slate-800 shadow-2xl">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Condivisione</span>
            <span className="text-white">Dati</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Menu Principale</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-xl flex-shrink-0 w-6 text-center transition-transform group-hover:scale-110 ${isActive(item.href) ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => {
              localStorage.removeItem('utenteLoggato');
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <span className="text-xl">🚪</span>
            <span>Esci (Logout)</span>
          </button>
          
          <div className="pt-3 text-center text-xs text-slate-400">
            <p className="font-semibold">© 2026 CondivisioneDati</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header + Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-40 shadow-lg">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-white text-2xl font-bold"
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>
        <h1 className="ml-4 text-lg font-bold text-white flex items-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Condivisione</span>
          <span className="ml-1">Dati</span>
        </h1>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-white flex-col border-r border-slate-800 shadow-xl transition-transform duration-300 z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-xl flex-shrink-0 w-6 text-center transition-transform group-hover:scale-110 ${isActive(item.href) ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem('utenteLoggato');
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-200 shadow-lg"
          >
            <span className="text-xl">🚪</span>
            <span>Esci (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Desktop Content Spacer */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
