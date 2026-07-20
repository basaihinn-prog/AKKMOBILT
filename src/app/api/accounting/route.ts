import { createClient } from '@/lib/supabase/server';
import { recordExpense, getExpenses, getDailyReport, getMonthlyReport } from '@/lib/supabase/services/accounting';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const reportType = searchParams.get('type');
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    if (reportType === 'daily') {
      const reportDate = date || new Date().toISOString().split('T')[0];
      const report = await getDailyReport(branchId, reportDate);
      return NextResponse.json(report);
    }

    if (reportType === 'monthly') {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const reportYear = year ? parseInt(year) : currentYear;
      const reportMonth = month ? parseInt(month) : currentMonth;
      const report = await getMonthlyReport(branchId, reportYear, reportMonth);
      return NextResponse.json(report);
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const expenses = await getExpenses(branchId, startDate || undefined, endDate || undefined, status || undefined);
    return NextResponse.json(expenses);
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

    const expenseData = await request.json();

    if (!expenseData.branchId) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const expense = await recordExpense(expenseData.branchId, expenseData, user.id);

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
