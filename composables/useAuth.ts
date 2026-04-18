import { authService } from '~/services/auth.service'

export function useAuth() {
  const access = useCookie<string | null>('access_token', { sameSite: 'lax' })
  const refresh = useCookie<string | null>('refresh_token', { sameSite: 'lax' })
  const loading = useState<boolean>('auth_loading', () => false)

  const { user, clearUser } = useAuthUser();

  const isAuthed = computed(() => !!access.value);

  function setTokens(a: string, r: string) {
    access.value = a
    refresh.value = r
  }

  async function login(username: string, userkey: string) {
    loading.value = true;
    try {
      const resp = await authService.login({ username, userkey });
      setTokens(resp.accessToken, resp.refreshToken);
      clearUser();
      await navigateTo('/admin')
    } finally {
      loading.value = false;
    }
  }

  async function validateAccess() {
    const v = await authService.validate();
    user.value = v.user;
    return true;
  }

  async function tryRefresh() {
    if (!refresh.value) return false;

    const resp = await authService.refresh({ refreshToken: refresh.value })
    setTokens(resp.accessToken, resp.refreshToken);
    user.value = resp.user;
    return true;
  }

  async function ensureSession() {
    if (!access.value && refresh.value) {
      try {
        return await tryRefresh();
      } catch {
        access.value = null;
        refresh.value = null;
        clearUser();
        return false;
      }
    }

    if (access.value) {
      try {
        return await validateAccess();
      } catch {
        try {
          return await tryRefresh();
        } catch {
          access.value = null;
          refresh.value = null;
          clearUser();
          return false;
        }
      }
    }

    return false;
  }

  function logout() {
    access.value = null;
    refresh.value = null;
    clearUser();
    return navigateTo('/login')
  }

  return { access, refresh, user, loading, isAuthed, login, logout, ensureSession };
}
