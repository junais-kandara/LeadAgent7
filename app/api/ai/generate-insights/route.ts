import { NextRequest, NextResponse } from 'next/server';
import { InsightGenerator } from '@/lib/ai/analyzers/insight-generator';
import { createAdminClient } from '@/lib/db/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const period = body.period === 'weekly' ? 'weekly' : body.period === 'monthly' ? 'monthly' : 'daily';

    const supabase = createAdminClient();
    let orgId = body.organizationId;

    if (!orgId) {
      const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
      if (!org) {
        return NextResponse.json({ error: 'No active organization found' }, { status: 404 });
      }
      orgId = org.id;
    }

    const generator = new InsightGenerator();
    const insight = await generator.generateReport(orgId, period);

    return NextResponse.json({ success: true, insight });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
