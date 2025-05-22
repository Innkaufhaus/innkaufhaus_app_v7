import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const logFileName = category.toLowerCase() === 'sql' ? 'sql-connection.log' : 'powershell.log';
    const logPath = path.join(process.cwd(), 'public', 'logs', logFileName);

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ error: 'Log file not found' }, { status: 404 });
    }

    const logContent = fs.readFileSync(logPath, 'utf-8');
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Content-Disposition', `attachment; filename="${logFileName}"`);

    return new NextResponse(logContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading logs:', error);
    return NextResponse.json(
      { error: 'Failed to download logs' },
      { status: 500 }
    );
  }
}
