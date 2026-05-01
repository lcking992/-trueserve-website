import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const QA_EMAIL = 'qa@trueserve.delivery'
const QA_PASSWORD = 'TrueServeQA_2026!'

async function resetQAUser() {
  console.log(`🔍 Looking up ${QA_EMAIL} in auth.users...`)

  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('listUsers error:', listErr.message); process.exit(1) }

  const existing = users.find(u => u.email === QA_EMAIL)

  let userId: string

  if (existing) {
    console.log(`✅ Found existing auth user: ${existing.id}`)
    userId = existing.id

    // Reset password + confirm email
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: QA_PASSWORD,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: 'QA_TESTER', name: 'QA Tester' }
    })
    if (updateErr) { console.error('updateUser error:', updateErr.message); process.exit(1) }
    console.log('✅ Password reset + email confirmed')
  } else {
    console.log(`⚠️  No auth user found — creating fresh account...`)
    const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
      email: QA_EMAIL,
      password: QA_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'QA_TESTER', name: 'QA Tester' }
    })
    if (createErr || !user) { console.error('createUser error:', createErr?.message); process.exit(1) }
    userId = user.id
    console.log(`✅ Created new auth user: ${userId}`)
  }

  // Upsert public User table with QA_TESTER role
  const { error: upsertErr } = await supabase.from('User').upsert({
    id: userId,
    email: QA_EMAIL,
    name: 'QA Tester',
    role: 'QA_TESTER',
    updatedAt: new Date().toISOString()
  }, { onConflict: 'id' })

  if (upsertErr) { console.error('User table upsert error:', upsertErr.message); process.exit(1) }
  console.log('✅ Public User table synced with QA_TESTER role')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  QA ACCOUNT RESET COMPLETE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Email:    ${QA_EMAIL}`)
  console.log(`  Password: ${QA_PASSWORD}`)
  console.log(`  Role:     QA_TESTER`)
  console.log(`  Auth ID:  ${userId}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Login at: localhost:3000/admin/login')
  console.log('   or prod: www.admin.trueserve.delivery/admin/login')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

resetQAUser().catch(console.error)
