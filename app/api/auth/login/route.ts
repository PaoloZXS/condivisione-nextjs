import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

/**
 * POST /api/auth/login
 * 
 * Gestisce il login dell'utente
 * Usa TURSO database per la produzione su Vercel
 */

// Crea client TURSO per CondivisioneDati (database dove sono gli utenti)
const getTursoClient = () => {
  const url = process.env.DATABASE_URL_CONDIVISIONEDATI;
  if (!url) {
    throw new Error('DATABASE_URL_CONDIVISIONEDATI non configurato');
  }
  return createClient({ url });
};

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

    console.log('[LOGIN] Attempting login for email:', email);

    // Connetti a TURSO
    const client = getTursoClient();
    
    // Ricerca utente nel database
    const result = await client.execute({
      sql: `SELECT * FROM tblogin WHERE email = ? AND password = ? AND attivo = 'S'`,
      args: [email.toString().trim(), password.toString()]
    });

    console.log('[LOGIN] Query result:', result);

    // Se l'utente non esiste o non è attivo
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { 
          id: 0,
          error: 'Credenziali non valide' 
        },
        { status: 401 }
      );
    }

    const user = result.rows[0] as any;
    console.log('[LOGIN] User found:', user.email);

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

    // Risposta con dati utente
    const response = NextResponse.json({
      id: user.idLogin,
      nome: user.nome,
      cognome: user.cognome,
      username: user.email,
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
    console.error('[LOGIN] Error caught:', error?.message || error);
    console.error('[LOGIN] Full error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
