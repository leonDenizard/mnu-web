export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function GET(
  request: Request,
  { params }: RouteContext<'/api/public/menu/[slug]/events'>,
) {
  const { slug } = await params
  const upstream = await fetch(`${apiUrl}/api/public/menu/${encodeURIComponent(slug)}/events`, {
    headers: {
      Accept: 'text/event-stream',
      ...(request.headers.get('last-event-id')
        ? { 'Last-Event-ID': request.headers.get('last-event-id')! }
        : {}),
    },
    cache: 'no-store',
  })

  if (!upstream.body) return new Response(null, { status: upstream.status })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
