import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const fromBranchId = searchParams.get('fromBranchId');
    const toBranchId = searchParams.get('toBranchId');
    const status = searchParams.get('status');

    let query = supabase
      .from('inventory_movements')
      .select('*, products(name, sku), auth_users(name)')
      .eq('movement_type', 'transfer');

    if (fromBranchId) {
      query = query.eq('warehouse_id', fromBranchId);
    }

    if (status) {
      // You may need to add a status column to track transfer status
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[transfers-get]', error);
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

    if (!body.fromBranchId || !body.toBranchId || !body.productId || !body.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transfer movements
    const { error: error1 } = await supabase
      .from('inventory_movements')
      .insert({
        warehouse_id: body.fromBranchId,
        product_id: body.productId,
        movement_type: 'transfer',
        quantity: -body.quantity,
        reason: `Transfer to branch ${body.toBranchId}`,
        created_by: user.id,
      });

    if (error1) throw error1;

    const { error: error2 } = await supabase
      .from('inventory_movements')
      .insert({
        warehouse_id: body.toBranchId,
        product_id: body.productId,
        movement_type: 'transfer',
        quantity: body.quantity,
        reason: `Transfer from branch ${body.fromBranchId}`,
        created_by: user.id,
      });

    if (error2) throw error2;

    return NextResponse.json({ status: 'transferred' }, { status: 201 });
  } catch (error) {
    console.error('[transfers-post]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
