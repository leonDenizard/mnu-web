const apiUrl = (process.env.MNU_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const email = process.env.MNU_LOAD_TEST_EMAIL
const password = process.env.MNU_LOAD_TEST_PASSWORD
const totalOrders = Number(process.env.MNU_LOAD_TEST_COUNT ?? 50)

if (process.env.MNU_LOAD_TEST_CONFIRM !== 'CREATE_TEST_ORDERS') {
  throw new Error(
    'This command creates real orders. Set MNU_LOAD_TEST_CONFIRM=CREATE_TEST_ORDERS to continue.',
  )
}

if (!email || !password) {
  throw new Error('Set MNU_LOAD_TEST_EMAIL and MNU_LOAD_TEST_PASSWORD.')
}

if (!Number.isInteger(totalOrders) || totalOrders < 1) {
  throw new Error('MNU_LOAD_TEST_COUNT must be a positive integer.')
}

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options)
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(`${response.status} ${JSON.stringify(body)}`)
  }

  return body
}

const login = await request('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const token = login.data.accessToken
const menu = await request(`/api/public/menu/${encodeURIComponent(login.data.user.slug)}`)
const product = menu.data.categories
  .flatMap((category) => category.products)
  .find((candidate) => candidate.modifierGroups.every((group) => !group.required))

if (!product) {
  throw new Error('No product without required modifier groups was found for this store.')
}

const startedAt = performance.now()
const results = await Promise.allSettled(
  Array.from({ length: totalOrders }, (_, index) =>
    request('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: `SSE load test ${index + 1}`,
        customerPhone: `119900${String(index).padStart(5, '0')}`,
        serviceType: 'PICKUP',
        paymentMethod: 'PIX',
        items: [{ productId: product.id, quantity: 1, orderModifierGroups: [] }],
      }),
    }),
  ),
)
const durationMs = Math.round(performance.now() - startedAt)
const fulfilled = results.filter((result) => result.status === 'fulfilled')
const rejected = results.filter((result) => result.status === 'rejected')

console.table({
  attempted: totalOrders,
  created: fulfilled.length,
  failed: rejected.length,
  durationMs,
  ordersPerSecond: Number((fulfilled.length / (durationMs / 1_000)).toFixed(2)),
})

if (rejected.length > 0) {
  console.error(
    rejected
      .slice(0, 5)
      .map((result) => (result.status === 'rejected' ? result.reason.message : null)),
  )
  process.exitCode = 1
}
