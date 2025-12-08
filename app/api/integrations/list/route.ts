import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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
      .select('team_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Fetch all integrations for this team
    const { data: integrations, error } = await supabase
      .from('data_integrations')
      .select('*')
      .eq('team_id', teamMember.team_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format response
    const formatted = integrations?.map((integration) => ({
      id: integration.id,
      type: integration.integration_type,
      name: integration.integration_name,
      status: integration.status,
      lastSync: integration.last_sync_at,
      dataPoints: integration.data_points,
      syncFrequency: integration.sync_frequency,
    })) || []

    return NextResponse.json({
      success: true,
      data: formatted,
      canManage: ['admin', 'analyst'].includes(teamMember.role),
    })
  } catch (error: any) {
    console.error('Integrations list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}
