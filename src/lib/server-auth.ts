import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getServerUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true
    }
  })
  
  return user
}

export async function requireAuth() {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  
  return user
}

export async function requireActiveSubscription() {
  const user = await requireAuth()
  
  if (!user.subscription || user.subscription.status !== 'ACTIVE') {
    throw new Error('Active subscription required')
  }
  
  return user
}