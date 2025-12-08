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

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch revenue data grouped by date
    const { data: revenueData } = await supabase
      .from('analytics_data')
      .select('metric_date, metric_value')
      .eq('team_id', teamMember.team_id)
      .eq('metric_type', 'revenue')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .lte('metric_date', new Date().toISOString().split('T')[0])
      .order('metric_date', { ascending: true })

    // Fetch conversion data for the same period
    const { data: conversionData } = await supabase
      .from('analytics_data')
      .select('metric_date, metric_value')
      .eq('team_id', teamMember.team_id)
      .eq('metric_type', 'purchases')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .lte('metric_date', new Date().toISOString().split('T')[0])
      .order('metric_date', { ascending: true })

    // Combine data
    const combined = revenueData?.map((item) => {
      const conversion = conversionData?.find(
        (c) => c.metric_date === item.metric_date
      )
      return {
        date: item.metric_date,
        revenue: Number(item.metric_value),
        transactions: conversion ? Number(conversion.metric_value) : 0,
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: combined,
      range,
    })
  } catch (error: any) {
    console.error('Revenue data error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
