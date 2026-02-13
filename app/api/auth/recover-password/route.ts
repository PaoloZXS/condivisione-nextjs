import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/recover-password
 * 
 * NOTA: Questa funzione non è ancora implementata
 * Verrà implementata in seguito quando avremo il servizio email configurato
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validazione input
    if (!email) {
      return NextResponse.json(
        { error: 'Email è obbligatoria' },
        { status: 400 }
      );
    }

    // Per ora, restituiamo un messaggio generico (senza rivelare se l'email esiste)
    // Questa è una best practice per la sicurezza
    return NextResponse.json({
      message: 'Se l\'email esiste nel nostro sistema, riceverai un\'email di recupero entro pochi minuti.'
    });

  } catch (error) {
    console.error('Errore recovery password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
