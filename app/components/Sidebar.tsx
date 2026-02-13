'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

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
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-600">
          <h2 className="text-2xl font-bold">
            <span className="text-blue-200">Condivisione</span>Dati
          </h2>
          <p className="text-xs text-blue-200 mt-2">Menu Principale</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="my-8 border-t border-blue-600"></div>

        {/* Logout Section */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              localStorage.removeItem('utenteLoggato');
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 font-medium"
          >
            <span className="text-xl">🚪</span>
            <span>Esci (Logout)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-xs text-blue-200 text-center">
          <p>© 2026 CondivisioneDati</p>
          <p>All rights reserved</p>
        </div>
      </aside>

      {/* Overlay per mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
