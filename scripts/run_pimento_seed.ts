import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const RESTAURANT = {
  name: 'Pimento Bay Kitchen and Marketplace',
  contactName: 'Pimento Bay Kitchen Team',
  email: 'info@pimentobaykitchen.com',
  password: 'PimentoBay2026!',
  phone: '+1.704-441-5832',
  address: '3306B West Highway 74',
  city: 'Monroe',
  state: 'NC',
  zip: '28110',
  description:
    'A Taste of the island To-Go. Authentic Caribbean cuisine with island market favorites, roti, patties, oxtail, jerk chicken, and fresh daily specials.',
  imageUrl:
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000&auto=format&fit=crop',
  openTime: '09:00:00',
  closeTime: '20:00:00',
}

const MENU = [
  { name: 'Beef Patty', description: 'Flaky pastry filled with seasoned beef.', price: 4.99 },
  { name: 'Chicken Patty', description: 'Golden pastry filled with savory spiced chicken.', price: 4.99 },
  { name: 'Veggie Patty', description: 'Caribbean-style pastry stuffed with vegetables.', price: 4.99 },
  { name: 'Coco Bread', description: 'Soft, slightly sweet Caribbean bread.', price: 3.49 },
  { name: 'Jerk Chicken - Small', description: 'Seasoned jerk chicken served with two sides.', price: 12.90 },
  { name: 'Jerk Chicken - Large', description: 'A larger jerk chicken portion with two sides.', price: 17.90 },
  { name: 'Oxtail and Bean - Small', description: 'Tender oxtail and beans with rich Caribbean spices. Available Thu, Fri and Sun.', price: 22.28 },
  { name: 'Oxtail and Bean - Large', description: 'Large oxtail and beans portion with three sides. Available Thu, Fri and Sun.', price: 28.74 },
  { name: 'Curried Chicken - Small', description: 'Classic curry chicken with island seasoning.', price: 12.99 },
  { name: 'Curried Chicken - Large', description: 'Hearty curried chicken plate with sides.', price: 16.99 },
  { name: 'Curry Goat - Small', description: 'Slow-cooked curry goat with bold island flavor.', price: 18.99 },
  { name: 'Curry Goat - Large', description: 'Large curry goat plate with your choice of sides.', price: 24.99 },
  { name: 'Brown Stew Chicken', description: 'Braised chicken in a rich brown gravy.', price: 14.99 },
  { name: 'Brown Stew Snapper', description: 'Red snapper cooked in brown stew sauce.', price: 18.99 },
  { name: 'Escovitch Snapper', description: 'Crispy snapper topped with escovitch vegetables.', price: 18.99 },
  { name: 'Jamaican Wings', description: 'Island-seasoned wings, crisp and flavorful.', price: 13.49 },
  { name: 'Roti - Curried Chicken', description: 'Warm roti filled with curried chicken.', price: 11.99 },
  { name: 'Roti - Ackee \'n Saltfish', description: 'Roti wrap filled with ackee and saltfish.', price: 12.99 },
  { name: 'Roti - Callaloo (No Salt Fish)', description: 'Vegetarian roti with callaloo filling.', price: 11.49 },
  { name: 'Rice and Peas', description: 'Traditional island-style rice and peas.', price: 4.99 },
  { name: 'Mac and Cheese', description: 'Creamy baked Caribbean-style macaroni pie.', price: 5.49 },
  { name: 'Sauteed Cabbage', description: 'Lightly seasoned cabbage side.', price: 4.99 },
  { name: 'Sweet Plantains', description: 'Sweet fried plantains.', price: 4.20 },
  { name: 'Festivals', description: 'Sweet fried dough, perfect with savory plates.', price: 4.50 },
  { name: 'Sorrel Juice', description: 'Refreshing hibiscus-based Caribbean drink.', price: 4.50 },
  { name: 'Ginger Beer', description: 'Spiced ginger beverage served chilled.', price: 3.99 },
]

async function geocodeRestaurant(address: string) {
  const fallback = { lat: 34.9897, lng: -80.5551 }
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return fallback

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const payload = await response.json()
    if (payload?.status === 'OK') {
      const location = payload.results?.[0]?.geometry?.location
      if (typeof location?.lat === 'number' && typeof location?.lng === 'number') {
        return { lat: location.lat, lng: location.lng }
      }
    }
  } catch {
    // Fall back to Monroe city center below.
  }

  return fallback
}

async function runPimentoSeed() {
  console.log('Seeding Pimento Bay Kitchen and Marketplace...')
  const now = new Date().toISOString()
  const fullAddress = `${RESTAURANT.address}, ${RESTAURANT.city}, ${RESTAURANT.state} ${RESTAURANT.zip}`

  // 1. Auth: create or find existing user
  let userId = ''
  let authCreated = false

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: RESTAURANT.email,
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: 'MERCHANT',
    },
  })

  if (created?.user) {
    userId = created.user.id
    authCreated = true
    console.log('Auth account created:', RESTAURANT.email)
  } else {
    if (createError && !createError.message.toLowerCase().includes('already')) {
      console.error('Auth creation error:', createError)
      process.exit(1)
    }
    // Already exists - find by listing
    const { data: userList } = await supabase.auth.admin.listUsers()
    const existing = userList?.users.find(
      (u) => u.email?.toLowerCase() === RESTAURANT.email.toLowerCase()
    )
    if (!existing) {
      console.error('Could not locate existing auth user for Pimento Bay Kitchen.')
      process.exit(1)
    }
    userId = existing.id
    authCreated = false
    console.log('Auth account already exists:', RESTAURANT.email)
    await supabase.auth.admin.updateUserById(existing.id, {
      password: RESTAURANT.password,
      email_confirm: true,
      user_metadata: {
        displayName: RESTAURANT.contactName,
        role: 'MERCHANT',
      },
    })
    console.log('   Password updated.')
  }

  // 2. Upsert User table record
  const { error: userError } = await supabase.from('User').upsert({
    id: userId,
    email: RESTAURANT.email,
    name: RESTAURANT.contactName,
    phone: RESTAURANT.phone,
    role: 'MERCHANT',
    address: fullAddress,
    createdAt: now,
    updatedAt: now,
  })
  if (userError) {
    console.error('User upsert error:', userError)
    process.exit(1)
  }
  console.log('User record upserted.')

  // 3. Geocode
  const { lat, lng } = await geocodeRestaurant(fullAddress)

  // 4. Upsert Restaurant
  const { data: existingRestaurant } = await supabase
    .from('Restaurant')
    .select('id')
    .ilike('name', '%Pimento Bay Kitchen%')
    .maybeSingle()

  const restaurantId = existingRestaurant?.id || uuidv4()

  const { error: restaurantError } = await supabase.from('Restaurant').upsert(
    {
      id: restaurantId,
      ownerId: userId,
      name: RESTAURANT.name,
      address: fullAddress,
      city: RESTAURANT.city,
      state: RESTAURANT.state,
      lat,
      lng,
      description: RESTAURANT.description,
      imageUrl: RESTAURANT.imageUrl,
      openTime: RESTAURANT.openTime,
      closeTime: RESTAURANT.closeTime,
      visibility: 'VISIBLE',
      isMock: false,
      plan: 'Flex Options',
      updatedAt: now,
      createdAt: now,
    },
    { onConflict: 'id' }
  )

  if (restaurantError) {
    console.error('Restaurant upsert error:', restaurantError)
    process.exit(1)
  }
  console.log('Restaurant profile set. ID:', restaurantId)

  // 5. Delete + insert menu items
  await supabase.from('MenuItem').delete().eq('restaurantId', restaurantId)

  const menuRows = MENU.map((item) => ({
    id: uuidv4(),
    restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    status: 'APPROVED',
    inventory: 100,
    createdAt: now,
    updatedAt: now,
  }))

  const { error: menuError } = await supabase.from('MenuItem').insert(menuRows)
  if (menuError) {
    console.error('Menu items insertion error:', menuError)
    process.exit(1)
  }
  console.log(`Menu seeded (${menuRows.length} items).`)

  console.log('\nPimento Bay Kitchen and Marketplace is ready to login!')
  console.log('   Email:', RESTAURANT.email)
  console.log('   Password:', RESTAURANT.password)
  console.log('   Address:', fullAddress)
  console.log('   Auth created (new):', authCreated)
  console.log('   URL: http://localhost:3000/merchant/login')
}

runPimentoSeed().catch((err) => {
  console.error(err)
  process.exit(1)
})
