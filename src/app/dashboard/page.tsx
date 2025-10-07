import { getServerUser } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const hasActiveSubscription = user.subscription?.status === 'ACTIVE'

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Premium Access Required
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You need an active subscription to access the dashboard.
            </p>
            <div className="mt-6">
              <a
                href="/subscribe"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <DashboardClient user={user} />
}