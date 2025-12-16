import { query, queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

// GET - List groups or get a specific group
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')
    const showtimeId = searchParams.get('showtimeId')

    if (groupId) {
      // Get specific group with members
      let group
      try {
        group = await queryOne<any>(
          `SELECT g.*, COALESCE(g.joinToken, NULL) as joinToken, u.name as creatorName, u.email as creatorEmail
           FROM BookingGroup g
           INNER JOIN User u ON g.createdBy = u.id
           WHERE g.id = ?`,
          [groupId]
        )
      } catch (err: any) {
        // If joinToken column doesn't exist, select without it
        if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
          group = await queryOne<any>(
            `SELECT g.*, u.name as creatorName, u.email as creatorEmail
             FROM BookingGroup g
             INNER JOIN User u ON g.createdBy = u.id
             WHERE g.id = ?`,
            [groupId]
          )
          if (group) group.joinToken = null
        } else {
          throw err
        }
      }

      if (!group) {
        return Response.json({ error: 'Group not found' }, { status: 404 })
      }

      const members = await query<any>(
        `SELECT m.*, u.name as userName, u.email as userEmail
         FROM GroupMember m
         INNER JOIN User u ON m.userId = u.id
         WHERE m.groupId = ?
         ORDER BY m.joinedAt ASC`,
        [groupId]
      )

      return Response.json({ group, members })
    }

    if (showtimeId) {
      // Get all groups for a showtime
      // Note: joinToken may not exist if migration hasn't been run yet
      try {
        const groups = await query<any>(
          `SELECT g.*, 
           COALESCE(g.joinToken, NULL) as joinToken,
           u.name as creatorName,
           (SELECT COUNT(*) FROM GroupMember WHERE groupId = g.id) as memberCount
           FROM BookingGroup g
           INNER JOIN User u ON g.createdBy = u.id
           WHERE g.showtimeId = ? AND g.status = 'ACTIVE'
           ORDER BY g.createdAt DESC`,
          [showtimeId]
        )

        return Response.json({ groups })
      } catch (err: any) {
        // If joinToken column doesn't exist, try without it
        if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
          const groups = await query<any>(
            `SELECT g.*, u.name as creatorName,
             (SELECT COUNT(*) FROM GroupMember WHERE groupId = g.id) as memberCount
             FROM BookingGroup g
             INNER JOIN User u ON g.createdBy = u.id
             WHERE g.showtimeId = ? AND g.status = 'ACTIVE'
             ORDER BY g.createdAt DESC`,
            [showtimeId]
          )
          // Add null joinToken for backward compatibility
          const groupsWithToken = groups.map((g: any) => ({ ...g, joinToken: null }))
          return Response.json({ groups: groupsWithToken })
        }
        throw err
      }
    }

    return Response.json({ error: 'groupId or showtimeId required' }, { status: 400 })
  } catch (error: any) {
    console.error('Failed to fetch groups:', error)
    return Response.json({ error: 'Failed to fetch groups', details: error.message }, { status: 500 })
  }
}

// POST - Create a new group
export async function POST(req: NextRequest) {
  try {
    // Get showcase mode dynamically
    const mockDb = await import('@/lib/mockDb').catch(() => null)
    const isShowcaseMode = mockDb?.IS_SHOWCASE_MODE || !process.env.DB_HOST || process.env.SHOWCASE_MODE === 'true'
    console.log('[Groups API] POST request received, showcase mode:', isShowcaseMode)
    
    // Parse request body first
    let body
    try {
      body = await req.json()
      console.log('[Groups API] Request body:', body)
    } catch (err) {
      console.error('[Groups API] Failed to parse request body:', err)
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { name, showtimeId, userId: bodyUserId } = body
    
    // In showcase mode, allow requests without authentication
    let userId: string | null = null
    
    if (!isShowcaseMode) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      userId = (session.user as any)?.id
      if (!userId && session.user?.email) {
        const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
        if (dbUser) userId = dbUser.id
      }

      if (!userId) {
        return Response.json({ error: 'User ID not found' }, { status: 401 })
      }
    } else {
      // In showcase mode, use demo user or get from request body
      userId = bodyUserId || 'demo-user'
      console.log('[Groups API] Using userId:', userId)
    }

    if (!name || !showtimeId) {
      console.error('[Groups API] Missing required fields:', { name, showtimeId })
      return Response.json({ error: 'name and showtimeId are required' }, { status: 400 })
    }

    // Verify showtime exists
    console.log('[Groups API] Verifying showtime:', showtimeId)
    const showtime = await queryOne<any>('SELECT id FROM Showtime WHERE id = ?', [showtimeId])
    if (!showtime) {
      console.error('[Groups API] Showtime not found:', showtimeId)
      return Response.json({ error: 'Showtime not found' }, { status: 404 })
    }
    console.log('[Groups API] Showtime verified:', showtime)

    const groupId = randomBytes(16).toString('hex')
    // Generate a unique, shareable join token
    const joinToken = `GB${randomBytes(8).toString('hex').toUpperCase()}`
    
    console.log('[Groups API] Creating group:', { groupId, name, userId, showtimeId, joinToken })
    
    // Try to insert with joinToken, fallback if column doesn't exist
    try {
      await execute(
        'INSERT INTO BookingGroup (id, name, createdBy, showtimeId, joinToken) VALUES (?, ?, ?, ?, ?)',
        [groupId, name, userId, showtimeId, joinToken]
      )
      console.log('[Groups API] Group inserted with joinToken')
    } catch (err: any) {
      console.log('[Groups API] Insert with joinToken failed, trying without:', err.message)
      // If joinToken column doesn't exist, insert without it
      if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
        await execute(
          'INSERT INTO BookingGroup (id, name, createdBy, showtimeId) VALUES (?, ?, ?, ?)',
          [groupId, name, userId, showtimeId]
        )
        console.log('[Groups API] Group inserted without joinToken')
      } else {
        console.error('[Groups API] Insert failed:', err)
        throw err
      }
    }

    // Add creator as member
    const memberId = randomBytes(16).toString('hex')
    console.log('[Groups API] Adding creator as member:', { memberId, groupId, userId })
    await execute(
      'INSERT INTO GroupMember (id, groupId, userId) VALUES (?, ?, ?)',
      [memberId, groupId, userId]
    )
    console.log('[Groups API] Member added')

    // Try to select with joinToken, fallback if column doesn't exist
    let group
    try {
      group = await queryOne<any>(
        `SELECT g.*, COALESCE(g.joinToken, NULL) as joinToken, u.name as creatorName
         FROM BookingGroup g
         INNER JOIN User u ON g.createdBy = u.id
         WHERE g.id = ?`,
        [groupId]
      )
      console.log('[Groups API] Group fetched with joinToken:', group)
    } catch (err: any) {
      console.log('[Groups API] Fetch with joinToken failed, trying without:', err.message)
      // If joinToken column doesn't exist, select without it
      if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
        group = await queryOne<any>(
          `SELECT g.*, u.name as creatorName
           FROM BookingGroup g
           INNER JOIN User u ON g.createdBy = u.id
           WHERE g.id = ?`,
          [groupId]
        )
        if (group) {
          group.joinToken = joinToken // Add joinToken manually
          console.log('[Groups API] Group fetched without joinToken, added manually:', group)
        }
      } else {
        console.error('[Groups API] Fetch failed:', err)
        throw err
      }
    }

    if (!group) {
      console.error('[Groups API] Group not found after creation:', groupId)
      return Response.json({ error: 'Failed to retrieve created group' }, { status: 500 })
    }

    console.log('[Groups API] Group created successfully:', group)
    return Response.json({ group, message: 'Group created successfully' })
  } catch (error: any) {
    console.error('[Groups API] Failed to create group:', error)
    console.error('[Groups API] Error stack:', error.stack)
    return Response.json({ error: 'Failed to create group', details: error.message }, { status: 500 })
  }
}

