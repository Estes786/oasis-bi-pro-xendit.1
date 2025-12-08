import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // For now, return mock traffic source data
    // In real app, this would come from integrations like Google Analytics
    const trafficSources = [
      { name: 'Google Ads', value: 35.2, color: '#3B82F6' },
      { name: 'Facebook Ads', value: 28.5, color: '#8B5CF6' },
      { name: 'Instagram', value: 18.3, color: '#EC4899' },
      { name: 'Direct', value: 12.4, color: '#10B981' },
      { name: 'Referral', value: 5.6, color: '#F59E0B' },
    ]

    const deviceBreakdown = [
      { name: 'Mobile', value: 62.5, color: '#3B82F6' },
      { name: 'Desktop', value: 31.2, color: '#8B5CF6' },
      { name: 'Tablet', value: 6.3, color: '#10B981' },
    ]

    return NextResponse.json({
      success: true,
      data: {
        trafficSources,
        deviceBreakdown,
      },
      range,
    })
  } catch (error: any) {
    console.error('Traffic data error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch traffic data' },
      { status: 500 }
    )
  }
}
