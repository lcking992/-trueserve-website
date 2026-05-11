import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

async function createQAUser() {
    const email = 'qa@trueserve.delivery'
    const password = 'TrueServeQA_2026!'
    const name = 'QA Tester'

    console.log(`Creating QA account: ${email}...`)

    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'CUSTOMER', name }
    })

    let userId = user?.id

    if (error && (error as any).code === 'email_exists') {
        console.log('Account already exists — fetching existing user...')
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existing = users.find(u => u.email === email)
        if (existing) userId = existing.id
    } else if (error) {
        console.error('Error creating user:', error.message)
        process.exit(1)
    }

    if (!userId) {
        console.error('Could not get user ID')
        process.exit(1)
    }

    // Sync to public User table
    await supabase.from('User').upsert({
        id: userId,
        email,
        name,
        role: 'CUSTOMER',
        updatedAt: new Date().toISOString()
    })

    console.log('\n✅ QA ACCOUNT READY')
    console.log('---------------------------')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('---------------------------')
    console.log('Share password with Santhini separately (not in email).')
}

createQAUser()
