import { createClient } from '@/lib/supabase/server';
import { createSale, getSales, getDailySalesReport } from '@/lib/supabase/services/sales';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const report = searchParams.get('report');

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    if (report === 'daily') {
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const reportData = await getDailySalesReport(branchId, date);
      return NextResponse.json(reportData);
    }

    const sales = await getSales(branchId, startDate || undefined, endDate || undefined);
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saleData = await request.json();

    if (!saleData.branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const sale = await createSale(saleData.branchId, saleData, user.id);

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
