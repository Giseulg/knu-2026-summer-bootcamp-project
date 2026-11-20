import { Navigate, Outlet } from 'react-router'
import { useMe } from '@/hooks/queries'

/** 온보딩 미완료 시 /onboarding 으로 보냄 */
export function OnboardingGuard() {
  const { data: me, isLoading } = useMe()
  if (isLoading) return null
  if (me && !me.onboarded) return <Navigate to="/onboarding" replace />
  return <Outlet />
}
