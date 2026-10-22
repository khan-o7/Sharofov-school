import { NextResponse } from 'next/server';
import { sendTelegramError } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stack, url, info } = body;
    const userAgent = req.headers.get('user-agent') || 'Noma‘lum';

    void sendTelegramError('Frontend Foydalanuvchi Xatosi', new Error(message || 'Noma’lum mijoz xatosi'), {
      url,
      info,
      userAgent: userAgent.slice(0, 150),
      stack: stack ? stack.slice(0, 300) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
