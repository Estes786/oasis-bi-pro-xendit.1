import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
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

    // Get user's team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Fetch all team members with user profiles
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        status,
        joined_at,
        user_id,
        user_profiles (
          email,
          full_name,
          avatar_url,
          company
        )
      `)
      .eq('team_id', teamMember.team_id)
      .order('joined_at', { ascending: true })

    if (error) throw error

    // Format response
    const formatted = members?.map((member: any) => ({
      id: member.id,
      userId: member.user_id,
      name: member.user_profiles?.full_name || 'User',
      email: member.user_profiles?.email || '',
      role: member.role,
      status: member.status,
      company: member.user_profiles?.company || '',
      avatarUrl: member.user_profiles?.avatar_url || null,
      joinedAt: member.joined_at,
      lastActive: getRelativeTime(member.joined_at), // Mock last active
    })) || []

    return NextResponse.json({
      success: true,
      data: formatted,
      currentUserRole: teamMember.role,
      canManage: ['admin', 'manager'].includes(teamMember.role),
    })
  } catch (error: any) {
    console.error('Team members error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// Helper function to get relative time
function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInMs = now.getTime() - past.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}
