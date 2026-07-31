import { NextRequest, NextResponse } from 'next/server';
import { Case } from '@/types/case';

// TODO: replace with real DB
const cases: Case[] = [];

export async function GET() {
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newCase: Case = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description ?? '',
    category: body.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'OPEN',
    severity: body.severity ?? 'MEDIUM',
    location: body.location ?? '',
    ownerUserId: body.ownerUserId ?? 'demo-user',
  };

  cases.push(newCase);

  return NextResponse.json(newCase, { status: 201 });
}
