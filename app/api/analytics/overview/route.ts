import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    // Create Supabase server client
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id, teams(id, name, plan)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const teamId = teamMember.team_id

    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - days)

    // Fetch current period data
    const { data: currentData } = await supabase
      .from('analytics_data')
      .select('metric_type, metric_value')
      .eq('team_id', teamId)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .lte('metric_date', new Date().toISOString().split('T')[0])

    // Fetch previous period data for growth calculation
    const { data: prevData } = await supabase
      .from('analytics_data')
      .select('metric_type, metric_value')
      .eq('team_id', teamId)
      .gte('metric_date', prevStartDate.toISOString().split('T')[0])
      .lt('metric_date', startDate.toISOString().split('T')[0])

    // Aggregate metrics
    const aggregateMetrics = (data: any[]) => {
      const metrics: any = {
        revenue: 0,
        users: 0,
        active_users: 0,
        conversions: 0,
      }

      data?.forEach((row) => {
        if (row.metric_type in metrics) {
          metrics[row.metric_type] += Number(row.metric_value)
        }
      })

      return metrics
    }

    const current = aggregateMetrics(currentData || [])
    const previous = aggregateMetrics(prevData || [])

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 0
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    // Calculate conversion rate
    const conversionRate = current.users > 0 
      ? Number(((current.conversions / current.users) * 100).toFixed(2))
      : 0

    const prevConversionRate = previous.users > 0
      ? Number(((previous.conversions / previous.users) * 100).toFixed(2))
      : 0

    const overview = {
      totalRevenue: current.revenue,
      revenueGrowth: calculateGrowth(current.revenue, previous.revenue),
      totalUsers: Math.round(current.users / days), // Average per day
      userGrowth: calculateGrowth(current.users, previous.users),
      activeUsers: Math.round(current.active_users / days), // Average per day
      activeGrowth: calculateGrowth(current.active_users, previous.active_users),
      conversionRate,
      conversionGrowth: calculateGrowth(conversionRate, prevConversionRate),
    }

    return NextResponse.json({
      success: true,
      data: overview,
      range,
      teamId,
    })
  } catch (error: any) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
