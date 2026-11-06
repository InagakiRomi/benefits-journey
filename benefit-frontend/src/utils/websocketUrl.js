const apiOrigin = import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_API_URL

/** WebSocket 連線網址：本機走 Vite 代理，正式環境連後端來源。 */
export function getWebSocketUrl() {
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws`
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL
  let apiUrl

  try {
    apiUrl = new URL(apiBaseUrl || apiOrigin, window.location.origin)
  } catch {
    apiUrl = new URL(apiOrigin)
  }

  // 相對路徑會落到 GitHub Pages，改連後端來源
  if (apiUrl.hostname.endsWith('github.io')) {
    apiUrl = new URL(apiOrigin)
  }

  const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${apiUrl.host}/ws`
}
