import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

type SeedMenuItem = {
  name: string;
  description: string;
  price: number;
  category: string;
};

const RESTAURANT = {
  name: "Krave 489",
  contactName: "Krave 489 Team",
  email: "info@krave489.com",
  password: "Krave489!2026",
  phone: "+1.803-558-4100",
  address: "489 S Herlong Ave",
  city: "Rock Hill",
  state: "SC",
  zip: "29732",
  description:
    "Coastal comfort, thoughtfully elevated. A relaxed seafood and comfort dining experience inspired by the Krave 489 menu and atmosphere.",
  imageUrl:
    "/merchant_hero.png",
  openTime: "11:00:00",
  closeTime: "22:00:00",
};

const MENU: SeedMenuItem[] = [
  { category: "Small Plates", name: "Seasonal Hummus", description: "House made hummus served in Breadsmith Bialy.", price: 12 },
  { category: "Small Plates", name: "Street Corn Ribs", description: "Chipotle crema, cotija cheese, cilantro.", price: 10 },
  { category: "Small Plates", name: "Burrata", description: "Frissee lettuce, roasted strawberry, strawberry lemon vinaigrette, grilled sourdough.", price: 16 },
  { category: "Small Plates", name: "Antipasti Skewers", description: "Salami, finocchiona, capicola, mozzarella balls, peperoncini, balsamic glaze.", price: 14 },
  { category: "Small Plates", name: "Whipped Feta Dip", description: "Cream cheese, feta, garlic, olive oil, lemon juice, roasted tomato, grilled sourdough.", price: 12 },
  { category: "Small Plates", name: "Tuna Nacho", description: "Pan seared tuna, pineapple and tomatillo salsa, avocado mousse, pickled onions, cilantro.", price: 18 },
  { category: "Small Plates", name: "Wagyu Beef Meatballs", description: "House made Wagyu beef meatballs, house made red sauce, lemon herb ricotta.", price: 15 },
  { category: "Small Plates", name: "Scallops", description: "Onion soubise, green apple foam, pistachio brittle.", price: 22 },
  { category: "Small Plates", name: "Mussels", description: "Garlic, tomato, broth, shallot, grilled sourdough.", price: 16 },
  { category: "Small Plates", name: "Blood Orange Ceviche", description: "Marinated shrimp, mango, onion, red bell pepper, cilantro, garlic, jicama.", price: 15 },
  { category: "Small Plates", name: "Sausage and Peppers", description: "Mild Italian sausage, pan roasted bell peppers, onions, house made peach mustarda.", price: 13 },
  { category: "Small Plates", name: "Crab Cakes", description: "House made crab cakes with signature remoulade.", price: 18 },
  { category: "Small Plates", name: "Teriyaki Shrimp Skewers", description: "Shrimp and pineapple skewers with a teriyaki glaze.", price: 16 },
  { category: "Small Plates", name: "Crispy Calamari", description: "House breaded calamari, blistered tomatoes, banana peppers, zesty remoulade.", price: 14 },
  { category: "Salads", name: "Watermelon and Feta Salad", description: "Fresh cut watermelon, marinated feta, mixed greens, lemon poppy seed vinaigrette.", price: 14 },
  { category: "Salads", name: "Southern Caesar Salad", description: "Romaine, house-made cornbread croutons, bacon, parmesan.", price: 14 },
  { category: "Salads", name: "The Gardenia", description: "Fresh mixed greens, tomatoes, house made croutons, cheddar, shredded carrots, red onions, cucumber.", price: 32 },
  { category: "Salads", name: "Krave Cobb", description: "Mixed greens, grilled chicken, avocado, tomatoes, hard boiled egg, blue cheese crumbles, and dressing.", price: 18 },
  { category: "Entrees", name: "Pan Roasted Chicken", description: "Pan roasted chicken, wild mushroom pilaf, grilled asparagus, pan jus.", price: 18 },
  { category: "Entrees", name: "Honey Garlic Salmon", description: "Blackened salmon, honey garlic glaze, crispy Brussel sprouts, Charleston crab rice.", price: 28 },
  { category: "Entrees", name: "House Pork Chop", description: "12 oz pork chop, smoked gouda mac and cheese, Brussels sprouts.", price: 26 },
  { category: "Entrees", name: "Lamb Burger", description: "Whipped feta, roasted red pepper, 6 oz lamb patty, arugula.", price: 18 },
  { category: "Entrees", name: "Steak Fritte", description: "8 oz filet mignon, golden mashed potato, peppercorn cream, grilled asparagus.", price: 42 },
  { category: "Entrees", name: "Cajun Shrimp Alfredo", description: "Blackened shrimp, red bell peppers, asparagus, garlic, onions, shallots, Cajun Alfredo.", price: 24 },
  { category: "Entrees", name: "Marry Me Chicken Gnocchi", description: "Pan roasted chicken, sun-dried tomato pesto cream sauce, spinach, gnocchi.", price: 22 },
  { category: "Entrees", name: "Pecan Crusted Catfish", description: "Panko and pecan crusted catfish, twice baked sweet potatoes, sauteed spinach.", price: 21 },
  { category: "Entrees", name: "Krave Fried Chicken", description: "House breaded chicken, Korean BBQ sauce, house made lime slaw.", price: 16 },
  { category: "Entrees", name: "Shrimp Po-Boy", description: "Calabash shrimp, fresh lettuce, tomatoes, zesty remoulade.", price: 18 },
  { category: "Entrees", name: "Tempura Lobster Roll", description: "Tempura battered lobster, ginger miso aioli, spicy mayo.", price: 34 },
  { category: "Entrees", name: "Shrimp and Grits", description: "Grilled shrimp, peppers, onions, bacon, andouille sausage, stone ground gouda grits.", price: 22 },
  { category: "Entrees", name: "Butternut Squash Risotto", description: "Butternut squash, parmesan cheese, sage and rosemary.", price: 16 },
  { category: "Entrees", name: "Lamb Chops", description: "Pistachio crusted lamb, gremolata, tzatziki, grilled asparagus, golden mash potato.", price: 32 },
  { category: "Seafood Boil", name: "Krave Shrimp Boil", description: "1 lb of shrimp, your choice of sausage, corn and potato.", price: 39 },
  { category: "Seafood Boil", name: "Krave Snow Crab", description: "1 lb of snow crab, your choice of sausage, corn and potato.", price: 59 },
  { category: "Seafood Boil", name: "Krave Lobster Boil", description: "1 lobster tail, ½ lb of shrimp, your choice of sausage, corn and potato.", price: 69 },
  { category: "Seafood Boil", name: "Krave Katch", description: "1 lobster tail, ½ lb of shrimp, ½ lb of crab, your choice of sausage, corn and potato.", price: 99 },
  { category: "Seafood Boil", name: "Add ½ lb of Shrimp", description: "Extra shrimp add-on.", price: 12 },
  { category: "Seafood Boil", name: "Add ½ lb of Crab", description: "Extra crab add-on.", price: 18 },
  { category: "Seafood Boil", name: "Add 1 Lobster Tail", description: "Extra lobster tail add-on.", price: 28 },
  { category: "Seafood Boil", name: "Add Sausage", description: "Extra sausage add-on.", price: 6 },
  { category: "Seafood Boil", name: "Add Corn/Potato", description: "Extra corn and potato add-on.", price: 5 },
  { category: "Seafood Boil", name: "Add 1 Hard Boiled Egg", description: "Extra hard boiled egg add-on.", price: 1.5 },
  { category: "Sides", name: "Twice Baked Sweet Potatoes", description: "Classic twice baked sweet potatoes.", price: 8 },
  { category: "Sides", name: "Rosemary Parmesan Fries", description: "Fries with rosemary and parmesan.", price: 6 },
  { category: "Sides", name: "Lime Slaw", description: "Fresh lime slaw.", price: 3 },
  { category: "Sides", name: "Brussel Sprouts", description: "Roasted brussel sprouts.", price: 5 },
  { category: "Sides", name: "Mushroom Pilaf", description: "Savory mushroom pilaf.", price: 6 },
  { category: "Sides", name: "Mashed Potatoes", description: "Creamy mashed potatoes.", price: 6 },
  { category: "Sides", name: "Asparagus", description: "Grilled asparagus.", price: 5 },
  { category: "Sides", name: "Roasted Vegetable Medley", description: "Seasonal roasted vegetables.", price: 5 },
  { category: "Sides", name: "Mac and Cheese", description: "Baked mac and cheese.", price: 8 },
  { category: "Desserts", name: "German Chocolate Pecan Pie", description: "Pecan pie with German chocolate notes.", price: 8 },
  { category: "Desserts", name: "Seasonal Cobbler", description: "Seasonal fruit cobbler.", price: 10 },
  { category: "Desserts", name: "Local Bakery Cake", description: "Ask about the current bakery cake.", price: 0 },
  { category: "Desserts", name: "Bread Pudding", description: "Warm bread pudding dessert.", price: 8 },
  { category: "Kids Cravings", name: "Kids Mac and Cheese and Fries", description: "Kid-sized mac and cheese with fries.", price: 0 },
  { category: "Kids Cravings", name: "Kids Grilled Cheese and Fries", description: "Kid-sized grilled cheese with fries.", price: 0 },
  { category: "Kids Cravings", name: "Kids Chicken Tenders and Fries", description: "Kid-sized chicken tenders with fries.", price: 0 },
  { category: "Kids Cravings", name: "Kids Spaghetti and Meatballs and Garlic Bread", description: "Kid-sized spaghetti and meatballs with garlic bread.", price: 0 },
  { category: "Kids Cravings", name: "Kids Chicken Alfredo and Garlic Bread", description: "Kid-sized chicken alfredo with garlic bread.", price: 0 },
  { category: "Kids Cravings", name: "Kids Steak and Fries", description: "Kid-sized steak with fries.", price: 0 },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function geocodeRestaurant(address: string) {
  const fallback = { lat: 34.9249, lng: -81.0251 };
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
    // Use Rock Hill fallback.
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
    throw new Error("Could not locate existing auth user for Krave 489.");
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

export async function seedKrave489() {
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
    .ilike("name", "%Krave 489%")
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
