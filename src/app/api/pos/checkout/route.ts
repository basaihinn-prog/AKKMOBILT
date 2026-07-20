import { createClient } from '@/lib/supabase/server';
import { createSale } from '@/lib/supabase/services/sales';
import { createCustomer, getCustomerByPhone } from '@/lib/supabase/services/customers';
import { NextRequest, NextResponse } from 'next/server';

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

    if (!body.branchId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Branch ID and items required' },
        { status: 400 }
      );
    }

    // Get company from branch
    const { data: branch } = await supabase
      .from('branches')
      .select('company_id')
      .eq('id', body.branchId)
      .single();

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Handle customer
    let customerId = body.customerId;
    if (!customerId && body.customerPhone) {
      // Try to find existing customer
      const existing = await getCustomerByPhone(branch.company_id, body.customerPhone);
      if (existing) {
        customerId = existing.id;
      } else if (body.customerName) {
        // Create new customer
        const newCustomer = await createCustomer(branch.company_id, {
          name: body.customerName,
          phone: body.customerPhone,
          email: body.customerEmail,
        });
        customerId = newCustomer.id;
      }
    }

    // Calculate totals
    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
    const taxAmount = Math.round(subtotal * 0.05); // 5% tax
    const discountAmount = body.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create sale
    const saleData = {
      customerId,
      totalAmount,
      taxAmount,
      discountAmount,
      paymentMethod: body.paymentMethod || 'cash',
      items: body.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity,
        imeiNumbers: item.imeiNumbers || [],
      })),
      notes: body.notes,
    };

    const sale = await createSale(body.branchId, saleData, user.id);

    return NextResponse.json(
      {
        id: sale.id,
        saleNumber: sale.sale_number,
        totalAmount: sale.total_amount,
        taxAmount: sale.tax_amount,
        discountAmount: sale.discount_amount,
        paymentMethod: sale.payment_method,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        items: body.items,
        timestamp: sale.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[checkout-post]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
