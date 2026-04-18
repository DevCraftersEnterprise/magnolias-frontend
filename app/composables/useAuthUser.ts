import { authService } from '~/services/auth.service'
import type { AuthUser } from '~/types/auth.types'

export const useAuthUser = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_user_loading', () => false)

  const loadUserFromToken = async () => {
    // si ya hay usuario, no recargues
    if (user.value) return user.value

    loading.value = true
    try {
      const resp = await authService.validate()
      if (resp?.valid && resp.user) {
        user.value = resp.user
        return user.value
      }
      user.value = null
      return null
    } catch (e) {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const clearUser = () => {
    user.value = null
  }

  return { user, loading, loadUserFromToken, clearUser }
}