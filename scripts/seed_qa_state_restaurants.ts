import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: ".env.local" });

const PROD_SUPABASE_REF = "fwkfddsiiybznvdrmack";

const STATES = [
  ["AL", "Birmingham", 33.5186, -86.8104],
  ["AK", "Anchorage", 61.2176, -149.8997],
  ["AZ", "Phoenix", 33.4484, -112.074],
  ["AR", "Little Rock", 34.7465, -92.2896],
  ["CA", "Los Angeles", 34.0522, -118.2437],
  ["CO", "Denver", 39.7392, -104.9903],
  ["CT", "Hartford", 41.7658, -72.6734],
  ["DE", "Wilmington", 39.7391, -75.5398],
  ["FL", "Orlando", 28.5383, -81.3792],
  ["GA", "Atlanta", 33.749, -84.388],
  ["HI", "Honolulu", 21.3099, -157.8581],
  ["ID", "Boise", 43.615, -116.2023],
  ["IL", "Chicago", 41.8781, -87.6298],
  ["IN", "Indianapolis", 39.7684, -86.1581],
  ["IA", "Des Moines", 41.5868, -93.625],
  ["KS", "Wichita", 37.6872, -97.3301],
  ["KY", "Louisville", 38.2527, -85.7585],
  ["LA", "Baton Rouge", 30.4515, -91.1871],
  ["ME", "Portland", 43.6591, -70.2568],
  ["MD", "Baltimore", 39.2904, -76.6122],
  ["MA", "Boston", 42.3601, -71.0589],
  ["MI", "Detroit", 42.3314, -83.0458],
  ["MN", "Minneapolis", 44.9778, -93.265],
  ["MS", "Jackson", 32.2988, -90.1848],
  ["MO", "Kansas City", 39.0997, -94.5786],
  ["MT", "Billings", 45.7833, -108.5007],
  ["NE", "Omaha", 41.2565, -95.9345],
  ["NV", "Las Vegas", 36.1716, -115.1391],
  ["NH", "Manchester", 42.9956, -71.4548],
  ["NJ", "Newark", 40.7357, -74.1724],
  ["NM", "Albuquerque", 35.0844, -106.6504],
  ["NY", "Buffalo", 42.8864, -78.8784],
  ["NC", "Raleigh", 35.7796, -78.6382],
  ["ND", "Fargo", 46.8772, -96.7898],
  ["OH", "Columbus", 39.9612, -82.9988],
  ["OK", "Oklahoma City", 35.4676, -97.5164],
  ["OR", "Portland", 45.5152, -122.6784],
  ["PA", "Philadelphia", 39.9526, -75.1652],
  ["RI", "Providence", 41.824, -71.4128],
  ["SC", "Columbia", 34.0007, -81.0348],
  ["SD", "Sioux Falls", 43.5446, -96.7311],
  ["TN", "Nashville", 36.1627, -86.7816],
  ["TX", "Austin", 30.2672, -97.7431],
  ["UT", "Salt Lake City", 40.7608, -111.891],
  ["VT", "Burlington", 44.4759, -73.2121],
  ["VA", "Richmond", 37.5407, -77.436],
  ["WA", "Seattle", 47.6062, -122.3321],
  ["WV", "Charleston", 38.3498, -81.6326],
  ["WI", "Milwaukee", 43.0389, -87.9065],
  ["WY", "Cheyenne", 41.14, -104.8202],
] as const;

function assertQaOnly() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const vercelEnv = (process.env.VERCEL_ENV || "").toLowerCase();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").toLowerCase();

  if (process.env.RUN_QA_STATE_RESTAURANT_SEED !== "true") {
    throw new Error("Set RUN_QA_STATE_RESTAURANT_SEED=true to seed QA state mock restaurants.");
  }

  if (
    vercelEnv === "production" ||
    process.env.NODE_ENV === "production" ||
    appUrl.includes("trueserve.delivery") ||
    supabaseUrl.includes(PROD_SUPABASE_REF)
  ) {
    throw new Error("Refusing to seed QA mock restaurants against production configuration.");
  }
}

async function main() {
  assertQaOnly();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase QA credentials.");

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const now = new Date().toISOString();

  for (const [state, city, lat, lng] of STATES) {
    const ownerEmail = `qa.restaurant.${state.toLowerCase()}@trueserve.qa`;
    const restaurantName = `TrueServe QA ${state} Kitchen`;
    const ownerId = uuidv4();

    const { data: existingOwner } = await supabase
      .from("User")
      .select("id")
      .eq("email", ownerEmail)
      .maybeSingle();

    const resolvedOwnerId = existingOwner?.id || ownerId;

    await supabase.from("User").upsert({
      id: resolvedOwnerId,
      email: ownerEmail,
      name: `${state} QA Merchant`,
      role: "MERCHANT",
      isMock: true,
      updatedAt: now,
    }, { onConflict: "id" });

    const { data: existingRestaurant } = await supabase
      .from("Restaurant")
      .select("id")
      .eq("name", restaurantName)
      .eq("state", state)
      .maybeSingle();

    const restaurantId = existingRestaurant?.id || uuidv4();
    await supabase.from("Restaurant").upsert({
      id: restaurantId,
      ownerId: resolvedOwnerId,
      name: restaurantName,
      address: `100 QA Market St, ${city}, ${state}`,
      city,
      state,
      lat,
      lng,
      description: `QA-only restaurant for ${state} location and marketplace testing.`,
      tags: ["QA", "Mock", "Local Favorites"],
      rating: 4.7,
      reviewCount: 125,
      visibility: "VISIBLE",
      isMock: true,
      imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1400&auto=format&fit=crop",
      updatedAt: now,
      createdAt: now,
    }, { onConflict: "id" });

    await supabase.from("MenuItem").delete().eq("restaurantId", restaurantId);
    await supabase.from("MenuItem").insert([
      {
        id: uuidv4(),
        restaurantId,
        name: "QA Local Plate",
        description: "Mock entree for QA ordering and category testing.",
        price: 12.99,
        category: "Entrees",
        status: "APPROVED",
        isAvailable: true,
        inventory: 99,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        restaurantId,
        name: "QA Quick Pickup Bowl",
        description: "Mock fast pickup item for non-production flows.",
        price: 9.99,
        category: "Fast Pickup",
        status: "APPROVED",
        isAvailable: true,
        inventory: 99,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  console.log(`Seeded ${STATES.length} QA-only mock restaurants. Production guard stayed active.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
