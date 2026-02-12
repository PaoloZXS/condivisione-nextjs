import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/login
 * 
 * Gestisce il login dell'utente
 * Sostituisce il vecchio servizio ASP.NET: servizi.asmx -> login_new
 * 
 * Controlla la tabella tblogin con email e password
 * Ritorna i dati dell'utente se validi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validazione input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Attempting login for email:', email)

    // Ricerca utente nel database (dalla tabella tblogin)
    const user = await prisma.user.findFirst({
      where: {
        email: email.toString().trim(),
        password: password.toString(), // In produzione, usare bcryptjs per hash
        attivo: 'S' // Solo utenti attivi
      }
    });

    console.log('[LOGIN] User found:', user ? 'Yes' : 'No')

    // Se l'utente non esiste o non è attivo
    if (!user) {
      return NextResponse.json(
        { 
          id: 0,
          error: 'Credenziali non valide' 
        },
        { status: 401 }
      );
    }

    // Controllo se l'utente è disabilitato
    if (user.attivo !== 'S') {
      return NextResponse.json(
        { 
          id: 0,
          error: 'Utente non abilitato all\'accesso' 
        },
        { status: 403 }
      );
    }

    // Generazione JWT token
    const token = jwt.sign(
      {
        idLogin: user.idLogin,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    // Risposta con dati utente (simile al vecchio login_new)
    const response = NextResponse.json({
      id: user.idLogin,
      nome: user.nome,
      cognome: user.cognome,
      username: user.email,
      password: user.password, // Non mandare in produzione!
      azienda: user.societa,
      tecnico: user.tecnicocod,
      attivo: user.attivo,
      typeutente: user.typeutente,
      colore: user.colore,
      token: token
    });

    // Imposta il cookie con il token
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 ore
    });

    return response;

  } catch (error: any) {
    console.error('[LOGIN] Error caught:', error?.message || error)
    console.error('[LOGIN] Full error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
