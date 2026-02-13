import { createClient } from '@libsql/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tecnico = searchParams.get('tecnico');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Connect to Assistenza database (TURSO - where Planning data is)
    const client = createClient({
      url: process.env.TURSO_ASSISTENZA_URL!,
      authToken: process.env.TURSO_ASSISTENZA_AUTH_TOKEN!,
    });

    // Build SQL query - TURSO format
    let query = `
      SELECT 
        id, 
        Proprietario, 
        Data, 
        Tecnico, 
        Codcliente, 
        Cliente, 
        Oggetto, 
        Giornataintera, 
        OraInizio, 
        OraFine, 
        Confermato, 
        Varie, 
        eseguito, 
        Privato, 
        Colore
      FROM PlanningInterventi 
      WHERE Data >= ? AND Data <= ?
    `;

    const params: any[] = [startDate, endDate];

    // Add tecnico filter if provided
    if (tecnico && tecnico !== 'all') {
      query += ` AND Tecnico = ?`;
      params.push(tecnico);
    }

    query += ` ORDER BY Data ASC`;

    // Execute query using TURSO format
    const result = await client.execute({
      sql: query,
      args: params,
    });

    // Format response - handle both array and object row formats
    const events = result.rows.map((row: any) => {
      // Handle if row is an array or object
      if (Array.isArray(row)) {
        return {
          id: row[0],
          proprietario: row[1],
          data: row[2],
          tecnico: row[3],
          codcliente: row[4],
          cliente: row[5],
          oggetto: row[6],
          giornataintera: row[7],
          orainizio: row[8],
          orafine: row[9],
          confermato: row[10],
          varie: row[11],
          eseguito: row[12],
          privato: row[13],
          colore: row[14],
        };
      } else {
        return row;
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching planning events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch planning events', details: String(error) },
      { status: 500 }
    );
  }
}
