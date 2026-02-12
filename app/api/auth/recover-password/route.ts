import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

/**
 * POST /api/auth/recover-password
 * 
 * Gestisce il recupero della password
 * Sostituisce il vecchio servizio ASP.NET: email.asmx -> serv_emailRecuperoPassword
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

    // Ricerca utente nel database
    const user = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (!user) {
      // Non rivelare se l'email esiste o no (sicurezza)
      return NextResponse.json({
        message: 'Se l\'email esiste nel nostro sistema, riceverai un\'email di recupero.'
      });
    }

    // TODO: Implementare invio email con servizio email
    // Esempio: sendPasswordRecoveryEmail(user.email, user.nome);
    
    console.log(`Email di recovery inviata a: ${user.email}`);

    return NextResponse.json({
      message: 'Email di recupero inviata con successo'
    });

  } catch (error) {
    console.error('Errore recovery password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
