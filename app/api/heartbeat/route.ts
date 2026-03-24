import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, name, model, os, cpu, ram, status } = data;

    if (!id) {
      return NextResponse.json({ error: 'Machine ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('machines')
      .upsert({
        id,
        name,
        model,
        os,
        cpu,
        ram,
        status: status || 'online',
        last_seen: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
