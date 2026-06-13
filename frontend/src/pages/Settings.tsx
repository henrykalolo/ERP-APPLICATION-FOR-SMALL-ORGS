import { useEffect, useState } from 'react'
import { authApi, notificationsApi, NotificationPreference } from '../api'
import { Card, ErrorState, LoadingState, PageHeader } from '../components/ui'

interface CurrentUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [userData, preferencesData] = await Promise.all([
        authApi.getCurrentUser(),
        notificationsApi.preferences.list(),
      ])
      setUser(userData)
      setPreferences(preferencesData)
    } catch (err) {
      setError('Unable to load settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile and notification preferences" />
      {error && <ErrorState message={error} />}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Profile">
          {loading && <LoadingState />}
          {!loading && user && (
            <dl className="space-y-3 text-sm">
              <div><dt className="font-medium text-gray-500">Email</dt><dd className="text-gray-900">{user.email}</dd></div>
              <div><dt className="font-medium text-gray-500">Username</dt><dd className="text-gray-900">{user.username}</dd></div>
              <div><dt className="font-medium text-gray-500">Name</dt><dd className="text-gray-900">{user.first_name} {user.last_name}</dd></div>
            </dl>
          )}
        </Card>
        <Card title="Notification Preferences">
          {loading && <LoadingState />}
          {!loading && preferences.length === 0 && <div className="text-sm text-gray-500">No preferences configured</div>}
          {!loading && preferences.map(preference => (
            <div key={preference.id} className="space-y-2 text-sm">
              <div>Email notifications: <span className="font-medium text-gray-900">{preference.email_notifications ? 'Enabled' : 'Disabled'}</span></div>
              <div>Push notifications: <span className="font-medium text-gray-900">{preference.push_notifications ? 'Enabled' : 'Disabled'}</span></div>
              <div>In-app notifications: <span className="font-medium text-gray-900">{preference.in_app_notifications ? 'Enabled' : 'Disabled'}</span></div>
              <div>Digest frequency: <span className="font-medium text-gray-900 capitalize">{preference.digest_frequency}</span></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
