// Middleware handles redirect to /login or /admin or /client.
// This page is never rendered for authenticated or unauthenticated users,
// but Next.js requires a default export.
export default function RootPage() {
  return null
}
