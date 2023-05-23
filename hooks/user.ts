import { useUserCtx } from '@/context/contexts'
import { endPoint } from '@/utils/data'
import { useRouter } from 'next/navigation'

export function useUser() {
  const route = useRouter()
  const { user } = useUserCtx()

  const isLoged = Boolean(user)

  const protectedRoute = () => {
    if(!user) {
      route.push('/login')
    }
  }

  return {
    isLoged,
    protectedRoute
  }
}