import { createClient } from '@libsql/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication - token può essere nel cookie o nell'Authorization header
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - token required' },
        { status: 401 }
      );
    }

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
    const dbUrl = process.env.DATABASE_URL_ASSISTENZA;
    if (!dbUrl) {
      throw new Error('DATABASE_URL_ASSISTENZA is not configured');
    }
    
    const client = createClient({
      url: dbUrl,
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

    console.log('🔍 [API] Query:', query);
    console.log('📊 [API] Params:', params);

    // Execute query using TURSO format
    const result = await client.execute({
      sql: query,
      args: params,
    });
    
    console.log('✅ [API] Result rows:', result.rows.length);

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
        // TURSO returns objects with exact column names, normalize to lowercase
        return {
          id: row.id,
          proprietario: row.Proprietario,
          data: row.Data,
          tecnico: row.Tecnico,
          codcliente: row.CodCliente,
          cliente: row.Cliente,
          oggetto: row.Oggetto,
          giornataintera: row.GiornataIntera,
          orainizio: row.OraInizio,
          orafine: row.OraFine,
          confermato: row.Confermato,
          varie: row.Varie,
          eseguito: row.eseguito,
          privato: row.Privato,
          colore: row.Colore || null,
        };
      }
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('❌ [API] Error fetching planning events');
    console.error('💥 Error message:', error?.message);
    console.error('🔍 Full error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch planning events', details: error?.message },
      { status: 500 }
    );
  }
}
