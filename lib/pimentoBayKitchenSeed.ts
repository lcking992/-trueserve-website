import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

type SeedMenuItem = {
  name: string;
  description: string;
  price: number;
};

const RESTAURANT = {
  name: "Pimento Bay Kitchen and Marketplace",
  contactName: "Pimento Bay Kitchen Team",
  email: "info@pimentobaykitchen.com",
  password: "PimentoBay2026!",
  phone: "+1.704-441-5832",
  address: "3306B West Highway 74",
  city: "Monroe",
  state: "NC",
  zip: "28110",
  description:
    "A Taste of the island To-Go. Authentic Caribbean cuisine with island market favorites, roti, patties, oxtail, jerk chicken, and fresh daily specials.",
  imageUrl:
    "/littlerichards_bbq_plate.png",
  openTime: "09:00:00",
  closeTime: "20:00:00",
};

const MENU: SeedMenuItem[] = [
  { name: "Beef Patty", description: "Flaky pastry filled with seasoned beef.", price: 4.99 },
  { name: "Chicken Patty", description: "Golden pastry filled with savory spiced chicken.", price: 4.99 },
  { name: "Veggie Patty", description: "Caribbean-style pastry stuffed with vegetables.", price: 4.99 },
  { name: "Coco Bread", description: "Soft, slightly sweet Caribbean bread.", price: 3.49 },
  { name: "Jerk Chicken - Small", description: "Seasoned jerk chicken served with two sides.", price: 12.90 },
  { name: "Jerk Chicken - Large", description: "A larger jerk chicken portion with two sides.", price: 17.90 },
  { name: "Oxtail and Bean - Small", description: "Tender oxtail and beans with rich Caribbean spices. Available Thu, Fri and Sun.", price: 22.28 },
  { name: "Oxtail and Bean - Large", description: "Large oxtail and beans portion with three sides. Available Thu, Fri and Sun.", price: 28.74 },
  { name: "Curried Chicken - Small", description: "Classic curry chicken with island seasoning.", price: 12.99 },
  { name: "Curried Chicken - Large", description: "Hearty curried chicken plate with sides.", price: 16.99 },
  { name: "Curry Goat - Small", description: "Slow-cooked curry goat with bold island flavor.", price: 18.99 },
  { name: "Curry Goat - Large", description: "Large curry goat plate with your choice of sides.", price: 24.99 },
  { name: "Brown Stew Chicken", description: "Braised chicken in a rich brown gravy.", price: 14.99 },
  { name: "Brown Stew Snapper", description: "Red snapper cooked in brown stew sauce.", price: 18.99 },
  { name: "Escovitch Snapper", description: "Crispy snapper topped with escovitch vegetables.", price: 18.99 },
  { name: "Jamaican Wings", description: "Island-seasoned wings, crisp and flavorful.", price: 13.49 },
  { name: "Roti - Curried Chicken", description: "Warm roti filled with curried chicken.", price: 11.99 },
  { name: "Roti - Ackee 'n Saltfish", description: "Roti wrap filled with ackee and saltfish.", price: 12.99 },
  { name: "Roti - Callaloo (No Salt Fish)", description: "Vegetarian roti with callaloo filling.", price: 11.49 },
  { name: "Rice and Peas", description: "Traditional island-style rice and peas.", price: 4.99 },
  { name: "Mac and Cheese", description: "Creamy baked Caribbean-style macaroni pie.", price: 5.49 },
  { name: "Sauteed Cabbage", description: "Lightly seasoned cabbage side.", price: 4.99 },
  { name: "Sweet Plantains", description: "Sweet fried plantains.", price: 4.20 },
  { name: "Festivals", description: "Sweet fried dough, perfect with savory plates.", price: 4.50 },
  { name: "Sorrel Juice", description: "Refreshing hibiscus-based Caribbean drink.", price: 4.50 },
  { name: "Ginger Beer", description: "Spiced ginger beverage served chilled.", price: 3.99 },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function geocodeRestaurant(address: string) {
  const fallback = { lat: 34.9897, lng: -80.5551 };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const payload = await response.json();
    if (payload?.status === "OK") {
      const location = payload.results?.[0]?.geometry?.location;
      if (typeof location?.lat === "number" && typeof location?.lng === "number") {
        return { lat: location.lat, lng: location.lng };
      }
    }
  } catch {
    // Fall back to Monroe city center below.
  }

  return fallback;
}

async function getOrCreateAuthUser() {
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: RESTAURANT.email,
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });

  if (created?.user) {
    return { userId: created.user.id, created: true };
  }

  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }

  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  const existing = userList.users.find((user) => user.email?.toLowerCase() === RESTAURANT.email.toLowerCase());
  if (!existing) {
    throw new Error("Could not locate existing auth user for Pimento Bay Kitchen.");
  }

  await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });

  return { userId: existing.id, created: false };
}

export async function seedPimentoBayKitchen() {
  const now = new Date().toISOString();
  const { userId, created: authCreated } = await getOrCreateAuthUser();
  const fullAddress = `${RESTAURANT.address}, ${RESTAURANT.city}, ${RESTAURANT.state} ${RESTAURANT.zip}`;
  const { lat, lng } = await geocodeRestaurant(fullAddress);

  await supabaseAdmin.from("User").upsert({
    id: userId,
    email: RESTAURANT.email,
    name: RESTAURANT.contactName,
    phone: RESTAURANT.phone,
    role: "MERCHANT",
    address: fullAddress,
    createdAt: now,
    updatedAt: now,
  });

  const { data: existingRestaurant } = await supabaseAdmin
    .from("Restaurant")
    .select("id")
    .ilike("name", "%Pimento Bay Kitchen%")
    .maybeSingle();

  const restaurantId = existingRestaurant?.id || uuidv4();
  const restaurantPayload = {
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
    visibility: "VISIBLE",
    isMock: false,
    plan: "Flex Options",
    updatedAt: now,
    createdAt: now,
  };

  const { error: restaurantError } = await supabaseAdmin.from("Restaurant").upsert(restaurantPayload, {
    onConflict: "id",
  });

  if (restaurantError) {
    throw restaurantError;
  }

  await supabaseAdmin.from("MenuItem").delete().eq("restaurantId", restaurantId);

  const menuRows = MENU.map((item) => ({
    id: uuidv4(),
    restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    status: "APPROVED",
    inventory: 100,
    createdAt: now,
    updatedAt: now,
  }));

  const { error: menuError } = await supabaseAdmin.from("MenuItem").insert(menuRows);
  if (menuError) {
    throw menuError;
  }

  return {
    success: true,
    restaurantId,
    userId,
    login: {
      email: RESTAURANT.email,
      password: RESTAURANT.password,
    },
    restaurant: {
      name: RESTAURANT.name,
      address: fullAddress,
      city: RESTAURANT.city,
      state: RESTAURANT.state,
      lat,
      lng,
    },
    menuCount: menuRows.length,
    authCreated,
  };
}
