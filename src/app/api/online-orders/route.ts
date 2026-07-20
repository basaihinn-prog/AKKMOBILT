import { NextRequest, NextResponse } from 'next/server';

// Mock online orders storage
const onlineOrders: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let results = onlineOrders;
    if (status) {
      results = results.filter((o: any) => o.status === status);
    }

    return NextResponse.json(results.slice(0, limit).reverse());
  } catch (error) {
    console.error('[orders-get]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = {
      id: `ORD-${Date.now()}`,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items,
      totalAmount: body.totalAmount,
      status: 'pending',
      channel: body.channel || 'website',
      createdAt: new Date(),
    };

    onlineOrders.push(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[orders-post]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orderId = searchParams.get('id') || request.nextUrl.pathname.split('/').pop();
    const body = await request.json();

    const order = onlineOrders.find((o: any) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = body.status;
    order.updatedAt = new Date();

    return NextResponse.json(order);
  } catch (error) {
    console.error('[orders-put]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
