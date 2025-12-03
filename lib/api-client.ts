// Client-side API utilities for fetching data

export async function fetchAnalyticsOverview(range: '7d' | '30d' | '90d' = '7d') {
  try {
    const response = await fetch(`/api/analytics/overview?range=${range}`)
    if (!response.ok) {
      throw new Error('Failed to fetch analytics overview')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    throw error
  }
}

export async function fetchRevenueData(range: '7d' | '30d' | '90d' = '7d') {
  try {
    const response = await fetch(`/api/analytics/revenue?range=${range}`)
    if (!response.ok) {
      throw new Error('Failed to fetch revenue data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    throw error
  }
}

export async function fetchTrafficData(range: '7d' | '30d' | '90d' = '7d') {
  try {
    const response = await fetch(`/api/analytics/traffic?range=${range}`)
    if (!response.ok) {
      throw new Error('Failed to fetch traffic data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching traffic data:', error)
    throw error
  }
}

export async function fetchIntegrations() {
  try {
    const response = await fetch('/api/integrations/list')
    if (!response.ok) {
      throw new Error('Failed to fetch integrations')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching integrations:', error)
    throw error
  }
}

export async function fetchTeamMembers() {
  try {
    const response = await fetch('/api/team/members')
    if (!response.ok) {
      throw new Error('Failed to fetch team members')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching team members:', error)
    throw error
  }
}

export async function disconnectIntegration(integrationId: string) {
  try {
    const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to disconnect integration')
    }
    return await response.json()
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    throw error
  }
}

export async function inviteTeamMember(email: string, role: string) {
  try {
    const response = await fetch('/api/team/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role }),
    })
    if (!response.ok) {
      throw new Error('Failed to invite team member')
    }
    return await response.json()
  } catch (error) {
    console.error('Error inviting team member:', error)
    throw error
  }
}

export async function updateMemberRole(memberId: string, role: string) {
  try {
    const response = await fetch(`/api/team/members/${memberId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })
    if (!response.ok) {
      throw new Error('Failed to update member role')
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating member role:', error)
    throw error
  }
}

export async function removeMember(memberId: string) {
  try {
    const response = await fetch(`/api/team/members/${memberId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to remove member')
    }
    return await response.json()
  } catch (error) {
    console.error('Error removing member:', error)
    throw error
  }
}
