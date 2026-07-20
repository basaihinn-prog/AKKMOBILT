import { createClient } from '@/lib/supabase/server';
import { createCustomer, getCustomers, searchCustomers, getCustomerByPhone, getCustomerStats } from '@/lib/supabase/services/customers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const query = searchParams.get('q');
    const phone = searchParams.get('phone');
    const customerId = searchParams.get('id');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    if (query) {
      const customers = await searchCustomers(companyId, query);
      return NextResponse.json(customers);
    }

    if (phone) {
      const customer = await getCustomerByPhone(companyId, phone);
      return NextResponse.json(customer || { error: 'Customer not found' });
    }

    if (customerId) {
      const stats = await getCustomerStats(customerId);
      return NextResponse.json(stats);
    }

    const customers = await getCustomers(companyId);
    return NextResponse.json(customers);
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

    const customerData = await request.json();

    if (!customerData.companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const customer = await createCustomer(customerData.companyId, customerData);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
