import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, password, query } = body;

    // Validate required fields
    if (!host || !port || !user || !password || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Execute the query
    const result = await executeQuery(
      { host, port: Number(port), user, password },
      query
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
