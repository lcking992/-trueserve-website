type RestaurantImageInput = {
  name?: string | null;
  cuisineType?: string | null;
  imageUrl?: string | null;
};

const FALLBACK_RESTAURANT_IMAGES = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80&auto=format&fit=crop",
  diner: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80&auto=format&fit=crop",
  steak: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80&auto=format&fit=crop",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80&auto=format&fit=crop",
  mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80&auto=format&fit=crop",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80&auto=format&fit=crop",
  general: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
};

export function getRestaurantDisplayImage(restaurant: RestaurantImageInput) {
  if (restaurant.imageUrl && restaurant.imageUrl.trim()) return restaurant.imageUrl;

  const text = `${restaurant.name || ""} ${restaurant.cuisineType || ""}`.toLowerCase();

  if (text.includes("steak 'n shake") || text.includes("steak n shake")) {
    return FALLBACK_RESTAURANT_IMAGES.burger;
  }
  if (text.includes("burger") || text.includes("shake") || text.includes("diner")) {
    return FALLBACK_RESTAURANT_IMAGES.diner;
  }
  if (text.includes("pizza")) return FALLBACK_RESTAURANT_IMAGES.pizza;
  if (text.includes("steak") || text.includes("bbq") || text.includes("barbecue")) return FALLBACK_RESTAURANT_IMAGES.steak;
  if (text.includes("sushi") || text.includes("asian")) return FALLBACK_RESTAURANT_IMAGES.sushi;
  if (text.includes("mexican") || text.includes("taco")) return FALLBACK_RESTAURANT_IMAGES.mexican;
  if (text.includes("coffee") || text.includes("cafe") || text.includes("bakery")) return FALLBACK_RESTAURANT_IMAGES.cafe;

  return FALLBACK_RESTAURANT_IMAGES.general;
}
