export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Ensure credentials are included to send cookies
  const opts = { ...options, credentials: 'include' as RequestCredentials };
  
  let res = await fetch(url, opts);
  
  // If unauthorized (401) or forbidden/missing token (403), try to refresh token
  if (res.status === 401 || res.status === 403) {
    try {
      const refreshRes = await fetch('http://localhost:8080/newAccessToken', { 
        method: 'GET',
        credentials: 'include' 
      });
      
      if (refreshRes.ok) {
        // Retry original request
        res = await fetch(url, opts);
      } else {
        // Refresh failed, token might be expired. Redirect to login.
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error("Refresh token request failed", error);
    }
  }
  
  return res;
}
