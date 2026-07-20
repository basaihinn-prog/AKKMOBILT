import { createClient } from '@/lib/supabase/server';
import { getProducts, createProduct, getCategories, getBrands, getModels } from '@/lib/supabase/services/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');
    const brandId = searchParams.get('brandId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    if (type === 'categories') {
      const categories = await getCategories(companyId);
      return NextResponse.json(categories);
    }

    if (type === 'brands') {
      const brands = await getBrands(companyId);
      return NextResponse.json(brands);
    }

    if (type === 'models') {
      const models = await getModels(companyId, brandId || undefined);
      return NextResponse.json(models);
    }

    const products = await getProducts(companyId);
    return NextResponse.json(products);
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

    const productData = await request.json();

    if (!productData.companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const product = await createProduct(productData.companyId, productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
