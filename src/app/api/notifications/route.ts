import { NextRequest, NextResponse } from 'next/server';

// Mock notifications storage
const notifications: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    return NextResponse.json(notifications.slice(0, limit).reverse());
  } catch (error) {
    console.error('[notifications-get]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.channel || !body.recipient || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = {
      id: `notif-${Date.now()}`,
      channel: body.channel,
      recipient: body.recipient,
      message: body.message,
      status: 'sent',
      createdAt: new Date(),
    };

    notifications.push(notification);

    // In production, you would integrate with:
    // - Telegram Bot API for Telegram messages
    // - SMS Gateway (Twilio, etc.) for SMS

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('[notifications-post]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
