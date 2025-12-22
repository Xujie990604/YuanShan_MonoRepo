const API_ORIGIN = (import.meta as any).env?.VITE_API_ORIGIN

/**
 * 把后端返回的图片路径规范化成浏览器可直接请求的 URL
 */
export function normalizePhotoUrl(url?: string): string | undefined {
  if (!url) return undefined
  const path = url.startsWith('/') ? url : `/${url}`
  return `${API_ORIGIN}${path}`
}


