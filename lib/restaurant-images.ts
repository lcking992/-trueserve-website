type RestaurantImageInput = {
  name?: string | null;
  cuisineType?: string | null;
  imageUrl?: string | null;
};

const FALLBACK_RESTAURANT_IMAGES = {
  burger: "/hero-burger.png",
  diner: "/olympia_western_omelet.png",
  pizza: "/hero-pizza.png",
  steak: "/thirteen_bones_ribs.png",
  sushi: "/hero-sushi.png",
  mexican: "/snappy_pork_chop.png",
  cafe: "/barneys_club_sandwich.png",
  general: "/hero_food_delivery.png",
};

export function getRestaurantDisplayImage(restaurant: RestaurantImageInput) {
  const text = `${restaurant.name || ""} ${restaurant.cuisineType || ""}`.toLowerCase();

  if (restaurant.imageUrl && restaurant.imageUrl.trim()) return restaurant.imageUrl;

  if (text.includes("dhan")) {
    return "/snappy_pork_chop.png";
  }

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
