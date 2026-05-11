import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const MOUNT_AIRY_NAMES = [
  "13 Bones",
  "Snappy Lunch",
  "Olympia Family Restaurant",
  "Little Richard's BBQ",
  "Old North State Winery",
  "Barney's Cafe"
]

async function cleanup() {
  const { data: restaurants } = await supabase
    .from('Restaurant')
    .select('id, ownerId, name')
    .in('name', MOUNT_AIRY_NAMES)

  if (!restaurants?.length) {
    console.log('No Mount Airy restaurants found in DB — already clean.')
    return
  }

  console.log(`Found ${restaurants.length} to remove:`, restaurants.map((r: any) => r.name))

  const ownerIds = restaurants.map((r: any) => r.ownerId).filter(Boolean)
  const restIds  = restaurants.map((r: any) => r.id)

  // Delete all child records first in dependency order
  const tables = ['MenuItem', 'Order', 'Review', 'HealthInspection', 'ComplianceRecord', 'RestaurantHours']
  for (const table of tables) {
    for (const id of restIds) {
      await supabase.from(table as any).delete().eq('restaurantId', id)
    }
  }
  console.log('✅ Child records cleared')

  // Now delete restaurants
  const { error: rErr } = await supabase.from('Restaurant').delete().in('id', restIds)
  if (rErr) console.error('Restaurant delete error:', rErr.message)
  else console.log(`✅ Deleted ${restIds.length} restaurants`)

  if (ownerIds.length) {
    const { error: uErr } = await supabase.from('User').delete().in('id', ownerIds)
    if (uErr) console.error('User delete error:', uErr.message)
    else console.log(`✅ Deleted ${ownerIds.length} fake user records`)
  }

  const { error: sErr } = await supabase.from('ServiceLocation').delete().eq('city', 'Mount Airy')
  if (sErr) console.error('ServiceLocation error:', sErr.message)
  else console.log('✅ Removed Mount Airy service location')

  console.log('\n✅ All Mount Airy data removed')
}

cleanup().catch(console.error)
