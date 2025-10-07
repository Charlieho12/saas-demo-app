import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/dashboard')
  }

  // Fetch all users with subscription data
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
      _count: {
        select: {
          videos: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform data for client component
  const userData = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    subscription: user.subscription ? {
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString() || null,
      stripeCustomerId: user.subscription.stripeCustomerId
    } : null,
    videoCount: user._count.videos
  }))

  return <AdminClient users={userData} />
}