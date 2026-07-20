import { createClient } from '@/lib/supabase/server';
import { getInventory, adjustStock, getLowStockItems, getInventorySummary } from '@/lib/supabase/services/inventory';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouseId = searchParams.get('warehouseId');
    const branchId = searchParams.get('branchId');
    const summary = searchParams.get('summary');

    if (summary === 'true' && branchId) {
      const inventorySummary = await getInventorySummary(branchId);
      return NextResponse.json(inventorySummary);
    }

    if (branchId) {
      const lowStock = await getLowStockItems(branchId);
      return NextResponse.json(lowStock);
    }

    if (!warehouseId) {
      return NextResponse.json({ error: 'Warehouse ID required' }, { status: 400 });
    }

    const inventory = await getInventory(warehouseId);
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('[inventory-api]', error);
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

    if (!body.warehouseId || !body.productId || body.quantity === undefined) {
      return NextResponse.json(
        { error: 'Warehouse ID, Product ID, and quantity required' },
        { status: 400 }
      );
    }

    const result = await adjustStock(
      body.warehouseId,
      body.productId,
      body.quantity,
      body.reason || 'Adjustment',
      user.id
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[inventory-post-error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
