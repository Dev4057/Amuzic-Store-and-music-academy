'use client'

import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '@amuzic/shared'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth()
  if (!role || !allowedRoles.includes(role)) return null
  return <>{children}</>
}
