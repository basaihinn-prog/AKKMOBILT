import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Mock VTU transactions table for now
const vtuTransactions: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Return mock VTU transactions
    if (branchId) {
      return NextResponse.json(
        vtuTransactions
          .filter((t: any) => t.branchId === branchId)
          .slice(0, limit)
      );
    }

    return NextResponse.json(vtuTransactions.slice(0, limit));
  } catch (error) {
    console.error('[vtu-get]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.phoneNumber || !body.amount || !body.operator) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate phone number format
    if (!/^\d{7,}$/.test(body.phoneNumber.replace(/^\+?95/, '09'))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Create VTU transaction record
    const transaction = {
      id: `vtu-${Date.now()}`,
      type: body.type || 'airtime',
      operator: body.operator,
      phoneNumber: body.phoneNumber,
      amount: body.amount,
      status: 'completed',
      branchId: body.branchId,
      createdAt: new Date(),
    };

    vtuTransactions.push(transaction);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('[vtu-post]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
