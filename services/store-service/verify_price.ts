import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
;(globalThis as any).WebSocket = ws

const supabase = createClient(
  'https://tmhygrmkvjljxerhxuqn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaHlncm1rdmpsanhlcmh4dXFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE1NDkwNSwiZXhwIjoyMDg5NzMwOTA1fQ.rgF8DDzBYqV6bQXPToYwn28E-twXhBhygJK6SlTroJQ'
)

const realAuthId = 'e929039c-23f4-47c8-a7b6-b876ed3d2948'
const now = new Date().toISOString()

async function main() {
  await supabase.from('User').insert({ id: realAuthId, email: 'dani@dani.cl', updatedAt: now })
  const sid = crypto.randomUUID()
  await supabase.from('Store').insert({
    id: sid, merchantId: realAuthId, name: 'VerifyPrice', slug: 'vp-' + Date.now(),
    status: 'TRIAL', createdAt: now, updatedAt: now,
  })

  console.log('=== Test: Decimal price values ===')
  const tests = [
    { price: 99.99, desc: 'float with cents' },
    { price: 100, desc: 'integer' },
    { price: 0.01, desc: 'very small float' },
    { price: 9999.50, desc: 'larger float' },
    { price: 0, desc: 'zero price' },
  ]

  for (const t of tests) {
    const { data, error } = await supabase
      .from('Product')
      .insert({
        store_id: sid, name: 'P-' + t.price, description: t.desc,
        price: t.price, stock: 10,
      })
      .select()
      .single()

    if (error) {
      console.log(`  ✗ price=${t.price} (${t.desc}): ${error.code} - ${error.message}`)
    } else {
      console.log(`  ✓ price=${t.price} → stored as ${data.price} (${t.desc})`)
      await supabase.from('Product').delete().eq('id', data.id)
    }
  }

  console.log('\n=== Cleanup ===')
  await supabase.from('Store').delete().eq('id', sid)
  await supabase.from('User').delete().eq('id', realAuthId)
  console.log('Done')
}

main().catch(console.error)
