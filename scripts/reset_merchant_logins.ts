import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const MERCHANTS = [
  { email: 'info@krave489.com',                     password: 'Krave489!2026',      name: 'Krave 489' },
  { email: 'info@pimentobaykitchen.com',             password: 'PimentoBay2026!',    name: 'Pimento Bay Kitchen' },
  { email: 'info@dhanskitchen.trueserve.delivery',   password: 'DhansKitchen2026!',  name: "Dhan's Kitchen" },
  { email: 'rockhill@dankburrito.com',               password: 'DankBurrito!2026',   name: 'Dank Burrito' },
  { email: 'steaknshake.rockhill@trueserve.com',     password: 'SteakShake!2026',    name: "Steak 'n Shake Rock Hill" },
]

async function resetAll() {
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('listUsers error:', listErr.message); process.exit(1) }

  console.log('\n🔄 Resetting all merchant logins...\n')

  const results: { name: string; email: string; password: string; status: string }[] = []

  for (const m of MERCHANTS) {
    const existing = users.find(u => u.email?.toLowerCase() === m.email.toLowerCase())

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: m.password,
        email_confirm: true,
        user_metadata: { ...existing.user_metadata, role: 'MERCHANT', name: m.name }
      })
      if (error) {
        console.error(`❌ ${m.name}: ${error.message}`)
        results.push({ ...m, status: `❌ FAILED: ${error.message}` })
      } else {
        // Sync User table role just in case
        await supabase.from('User').update({ role: 'MERCHANT' }).eq('email', m.email)
        console.log(`✅ ${m.name} reset`)
        results.push({ ...m, status: '✅ OK' })
      }
    } else {
      // Create from scratch
      const { data: { user }, error } = await supabase.auth.admin.createUser({
        email: m.email,
        password: m.password,
        email_confirm: true,
        user_metadata: { role: 'MERCHANT', name: m.name }
      })
      if (error || !user) {
        console.error(`❌ ${m.name} (create): ${error?.message}`)
        results.push({ ...m, status: `❌ CREATE FAILED: ${error?.message}` })
      } else {
        await supabase.from('User').upsert({
          id: user.id, email: m.email, name: m.name, role: 'MERCHANT',
          updatedAt: new Date().toISOString()
        }, { onConflict: 'id' })
        console.log(`✅ ${m.name} created`)
        results.push({ ...m, status: '✅ CREATED' })
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  MERCHANT LOGINS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  for (const r of results) {
    console.log(`\n  ${r.name}  ${r.status}`)
    console.log(`  Email:    ${r.email}`)
    console.log(`  Password: ${r.password}`)
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Login at: localhost:3000/merchant/login')
  console.log('   or prod: trueserve.delivery/merchant/login')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

resetAll().catch(console.error)
