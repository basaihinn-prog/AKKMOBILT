import { createClient } from '@/lib/supabase/server';
import { createRepair, getRepairs, getPendingRepairs } from '@/lib/supabase/services/repairs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const pending = searchParams.get('pending');

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    if (pending === 'true') {
      const repairs = await getPendingRepairs(branchId);
      return NextResponse.json(repairs);
    }

    const repairs = await getRepairs(branchId, status || undefined);
    return NextResponse.json(repairs);
  } catch (error) {
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

    const repairData = await request.json();

    if (!repairData.branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const repair = await createRepair(repairData.branchId, repairData);

    return NextResponse.json(repair, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
