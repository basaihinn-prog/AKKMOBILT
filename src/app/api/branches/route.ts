import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get user's company from auth context (you'll need to implement this based on your auth setup)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company and branches
    const { data: userProfile } = await supabase
      .from('auth_users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: branches, error } = await supabase
      .from('branches')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
