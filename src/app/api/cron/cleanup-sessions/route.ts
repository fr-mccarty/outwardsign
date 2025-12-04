import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request from Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('cleanup_expired_auth_sessions')

  if (error) {
    console.error('Session cleanup failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('Session cleanup completed:', data)
  return NextResponse.json({ success: true, cleaned: data })
}
