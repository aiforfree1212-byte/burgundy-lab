'use client'

import { SessionProvider } from 'next-auth/react'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
