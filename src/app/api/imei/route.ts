import { createClient } from '@/lib/supabase/server';
import { getIMEITracking, registerIMEI, searchIMEI, getIMEIStats } from '@/lib/supabase/services/imei';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const imei = searchParams.get('imei');
    const query = searchParams.get('q');
    const stats = searchParams.get('stats');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    if (stats === 'true') {
      const imeiStats = await getIMEIStats(companyId);
      return NextResponse.json(imeiStats);
    }

    if (query) {
      const results = await searchIMEI(companyId, query);
      return NextResponse.json(results);
    }

    if (imei) {
      const tracking = await getIMEITracking(companyId, imei);
      if (!tracking) {
        return NextResponse.json({ error: 'IMEI not found' }, { status: 404 });
      }
      return NextResponse.json(tracking);
    }

    return NextResponse.json({ error: 'IMEI or query parameter required' }, { status: 400 });
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

    const imeiData = await request.json();

    if (!imeiData.companyId || !imeiData.imei) {
      return NextResponse.json({ error: 'Company ID and IMEI required' }, { status: 400 });
    }

    const tracking = await registerIMEI(imeiData.companyId, imeiData);

    return NextResponse.json(tracking, { status: 201 });
  } catch (error: any) {
    const message = error.message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: error.message?.includes('already') ? 409 : 500 });
  }
}
