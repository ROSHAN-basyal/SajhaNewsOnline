'use client'

import { AuthProvider, useAuth } from '../../lib/authContext'
import AdminLogin from '../../components/AdminLogin'
import AdminDashboard from '../../components/AdminDashboard'
import '../../styles/admin.css'

function AdminPortalContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}

export default function AdminPortal() {
  return (
    <AuthProvider>
      <AdminPortalContent />
    </AuthProvider>
  )
}