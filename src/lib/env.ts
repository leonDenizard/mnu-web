const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

export const env = {
  apiUrl: apiUrl.replace(/\/$/, ''),
  appUrl: appUrl.replace(/\/$/, '')
}
