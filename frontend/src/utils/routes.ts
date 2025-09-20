// Centralized routes configuration
export const ROUTES = {
  DASHBOARD: '/',
  CHAT: '/chat',
  UPLOAD: '/upload',
} as const

// Route labels for navigation
export const ROUTE_LABELS = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.CHAT]: 'AI Chat',
  [ROUTES.UPLOAD]: 'Upload CVs',
} as const

// Navigation items with consistent ordering
export const NAVIGATION_ITEMS = [
  { name: ROUTE_LABELS[ROUTES.DASHBOARD], href: ROUTES.DASHBOARD },
  { name: ROUTE_LABELS[ROUTES.CHAT], href: ROUTES.CHAT },
  { name: ROUTE_LABELS[ROUTES.UPLOAD], href: ROUTES.UPLOAD },
] as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]
