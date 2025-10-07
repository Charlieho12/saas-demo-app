import { requireActiveSubscription } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import VideosClient from './VideosClient'

export default async function VideosPage() {
  try {
    const user = await requireActiveSubscription()
    return <VideosClient />
  } catch (error) {
    redirect('/dashboard')
  }
}