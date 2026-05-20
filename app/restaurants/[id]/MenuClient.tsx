"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, Clock3, Gift, MapPin, PackageCheck, ReceiptText, Route, ShieldCheck, Sparkles, Star, X, Zap, ZoomIn, ZoomOut } from "lucide-react";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";
import AddressInput from "@/components/AddressInput";
import MapWithDirections from "@/components/MapWithDirections";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DELIVERY_STORAGE_KEYS = {
    address: "ts.delivery.address",
    lat: "ts.delivery.lat",
    lng: "ts.delivery.lng",
    preference: "ts.delivery.preference",
    unit: "ts.delivery.unit",
    accessCode: "ts.delivery.accessCode",
    instructions: "ts.delivery.instructions",
} as const;

const MENU_ZOOM_LEVELS = ["compact", "comfortable", "large"] as const;
type MenuZoomLevel = typeof MENU_ZOOM_LEVELS[number];
type DeliverySpeed = "EXPRESS" | "STANDARD" | "SCHEDULED";
type DropoffPreference = "Leave at door" | "Hand to me" | "Meet outside";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category?: string | null;
    saleUntil?: string | null;
    originalPrice?: number | null;
}

interface MenuClientProps {
    userId?: string;
    truePointsBalance?: number;
    restaurant: any;
    items: MenuItem[];
    orderingEnabled: boolean;
    isOpen?: boolean;
    openTimeDisplay?: string;
    closeTimeDisplay?: string;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MenuClient({
    userId,
    truePointsBalance = 0,
    restaurant,
    items,
    orderingEnabled,
    isOpen = true,
    openTimeDisplay = "08:00",
    closeTimeDisplay = "22:00",
    initialAddress = undefined,
    initialLat = undefined,
    initialLng = undefined,
}: MenuClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [tipPct, setTipPct] = useState(15);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(initialAddress || null);
    const [deliveryLat, setDeliveryLat] = useState<number | null>(
        typeof initialLat === "number" && Number.isFinite(initialLat) ? initialLat : null
    );
    const [deliveryLng, setDeliveryLng] = useState<number | null>(
        typeof initialLng === "number" && Number.isFinite(initialLng) ? initialLng : null
    );
    const [baseDeliveryLat, setBaseDeliveryLat] = useState<number | null>(
        typeof initialLat === "number" && Number.isFinite(initialLat) ? initialLat : null
    );
    const [baseDeliveryLng, setBaseDeliveryLng] = useState<number | null>(
        typeof initialLng === "number" && Number.isFinite(initialLng) ? initialLng : null
    );
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [dropoffPreference, setDropoffPreference] = useState<DropoffPreference>("Leave at door");
    const [unit, setUnit] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("STANDARD");
    const [scheduledFor, setScheduledFor] = useState("");
    const [deliveryPinAdjusted, setDeliveryPinAdjusted] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

    // Gift a Meal
    const [isGift, setIsGift] = useState(false);
    const [giftName, setGiftName] = useState("");
    const [giftPhone, setGiftPhone] = useState("");
    const [giftNote, setGiftNote] = useState("");
    const [giftHideReceipt, setGiftHideReceipt] = useState(true);
    const [redeemPoints, setRedeemPoints] = useState(false);
    const [checkoutEta, setCheckoutEta] = useState<string>("Calculating...");
    const [checkoutDistance, setCheckoutDistance] = useState<string>("");
    const [menuZoom, setMenuZoom] = useState<MenuZoomLevel>("comfortable");
    
    // GHL State
    const [isGHLOpen, setIsGHLOpen] = useState(false);
    const [ghlLoading, setGHLLoading] = useState(false);
    
    // Hardcoded GHL demo for Dhan's Kitchen per request
    const ghlUrl = restaurant.name.includes("Dhan") 
        ? "https://api.leadconnectorhq.com/widget/booking/demo-dhans-kitchen"
        : restaurant.ghlUrl; // Assuming fallback to DB field

    const openGHL = () => {
        if(!ghlUrl) {
            alert("No GHL embed configured for this restaurant.");
            return;
        }
        setGHLLoading(true);
        setIsGHLOpen(true);
    };

    // Cart calculations
    const cartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
    const subtotal = cartItems.reduce((sum, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);
    
    const tax = subtotal * 0.07;
    const tip = subtotal * (tipPct / 100);
    const pointsValue = Math.min(Math.floor(truePointsBalance / 100) * 100, Math.max(0, Math.floor((subtotal + tip - 0.50) * 100)));
    const pointsDiscount = redeemPoints ? pointsValue * 0.01 : 0;
    const total = subtotal + 2.99 + tax + tip - pointsDiscount;
    const basePoints = Math.max(0, Math.floor(subtotal));
    const rewardsPlan = userId ? "Basic" : "Guest";
    const rewardsMultiplier = rewardsPlan === "Premium" ? 2 : rewardsPlan === "Plus" ? 1.5 : 1;
    const estimatedPoints = Math.floor(basePoints * rewardsMultiplier);
    const nextTierText = userId
        ? "Plus unlocks 1.5x points and priority dispatch. Premium unlocks 2x points and concierge support."
        : "Sign in to bank points, unlock priority dispatch, and redeem rewards later.";
    const deliveryOptions: Array<{
        id: DeliverySpeed;
        label: string;
        detail: string;
        icon: typeof Zap;
    }> = [
        { id: "EXPRESS", label: "Express", detail: "Fastest dispatch when drivers are nearby.", icon: Zap },
        { id: "STANDARD", label: "Standard", detail: "Best balance for fresh local delivery.", icon: PackageCheck },
        { id: "SCHEDULED", label: "Schedule", detail: "Choose a later delivery window.", icon: CalendarClock },
    ];
    const locationLabel = deliveryAddress
        ? deliveryAddress.split(",").slice(0, 2).join(", ").trim()
        : "Select delivery address";
    const restaurantLat = typeof restaurant.lat === "number" ? restaurant.lat : Number(restaurant.lat);
    const restaurantLng = typeof restaurant.lng === "number" ? restaurant.lng : Number(restaurant.lng);
    const hasRestaurantLocation = Number.isFinite(restaurantLat) && Number.isFinite(restaurantLng);
    const restaurantAddressLabel = [restaurant.address, restaurant.city, restaurant.state].filter(Boolean).join(", ");
    const restaurantMapSrc = hasRestaurantLocation
        ? `https://www.google.com/maps?q=${restaurantLat},${restaurantLng}&z=15&output=embed`
        : `https://www.google.com/maps?q=${encodeURIComponent(restaurantAddressLabel || restaurant.name)}&z=15&output=embed`;
    const hasCheckoutRoute =
        hasRestaurantLocation &&
        deliveryLat !== null &&
        deliveryLng !== null;
    const isDhansKitchen = Boolean(restaurant?.name?.toLowerCase?.().includes("dhan"));

    useEffect(() => {
        try {
            const savedAddress = localStorage.getItem(DELIVERY_STORAGE_KEYS.address);
            const savedLat = localStorage.getItem(DELIVERY_STORAGE_KEYS.lat);
            const savedLng = localStorage.getItem(DELIVERY_STORAGE_KEYS.lng);
            const savedPreference = localStorage.getItem(DELIVERY_STORAGE_KEYS.preference);
            const savedUnit = localStorage.getItem(DELIVERY_STORAGE_KEYS.unit);
            const savedAccessCode = localStorage.getItem(DELIVERY_STORAGE_KEYS.accessCode);
            const savedInstructions = localStorage.getItem(DELIVERY_STORAGE_KEYS.instructions);

            if (!deliveryAddress && savedAddress && savedAddress.trim()) {
                setDeliveryAddress(savedAddress.trim());
            }
            if (deliveryLat === null && savedLat && Number.isFinite(Number(savedLat))) {
                setDeliveryLat(Number(savedLat));
                setBaseDeliveryLat(Number(savedLat));
            }
            if (deliveryLng === null && savedLng && Number.isFinite(Number(savedLng))) {
                setDeliveryLng(Number(savedLng));
                setBaseDeliveryLng(Number(savedLng));
            }
            if (savedPreference === "Leave at door" || savedPreference === "Hand to me" || savedPreference === "Meet outside") {
                setDropoffPreference(savedPreference);
            }
            if (savedUnit) setUnit(savedUnit);
            if (savedAccessCode) setAccessCode(savedAccessCode);
            if (savedInstructions) setDeliveryInstructions(savedInstructions);
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(DELIVERY_STORAGE_KEYS.preference, dropoffPreference);
            if (unit.trim()) localStorage.setItem(DELIVERY_STORAGE_KEYS.unit, unit.trim());
            else localStorage.removeItem(DELIVERY_STORAGE_KEYS.unit);
            if (accessCode.trim()) localStorage.setItem(DELIVERY_STORAGE_KEYS.accessCode, accessCode.trim());
            else localStorage.removeItem(DELIVERY_STORAGE_KEYS.accessCode);
            if (deliveryInstructions.trim()) localStorage.setItem(DELIVERY_STORAGE_KEYS.instructions, deliveryInstructions.trim());
            else localStorage.removeItem(DELIVERY_STORAGE_KEYS.instructions);
        } catch { }
    }, [accessCode, deliveryInstructions, dropoffPreference, unit]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(`ts.reorder.${restaurant.id}`);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed || parsed.restaurantId !== restaurant.id || !Array.isArray(parsed.items)) return;

            const nextCart: { [key: string]: number } = {};
            for (const item of parsed.items) {
                const id = String(item.id || "");
                const quantity = Number(item.quantity || 0);
                if (id && quantity > 0 && items.some((menuItem) => menuItem.id === id)) {
                    nextCart[id] = Math.min(20, Math.floor(quantity));
                }
            }
            if (Object.keys(nextCart).length > 0) {
                setCart(nextCart);
                localStorage.removeItem(`ts.reorder.${restaurant.id}`);
            }
        } catch { }
    }, [items, restaurant.id]);

    const handleCartChange = (newCart: { [key: string]: number }) => {
        setCart(newCart);
    };

    const addItem = (id: string) => {
        handleCartChange({ ...cart, [id]: (cart[id] || 0) + 1 });
    };

    const chgQty = (id: string, d: number) => {
        const newCart = { ...cart };
        newCart[id] = (newCart[id] || 0) + d;
        if (newCart[id] <= 0) delete newCart[id];
        handleCartChange(newCart);
    };

    const removeItem = (id: string) => {
        const newCart = { ...cart };
        delete newCart[id];
        handleCartChange(newCart);
    };

    useEffect(() => {
        const syncPaymentIntent = async () => {
            const nextCartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
            if (!nextCartItems.length) {
                setClientSecret(null);
                setCheckoutDistance("");
                return;
            }

            const res = await createPaymentIntent(
                restaurant.id,
                nextCartItems.map(([id, quantity]) => ({ id, quantity })),
                tip,
                redeemPoints ? pointsValue : 0
            );

            if (res.clientSecret) {
                setClientSecret(res.clientSecret);
            }
        };

        syncPaymentIntent();
    }, [cart, pointsValue, redeemPoints, restaurant.id, tip]);

    const normalizedItems = items.map((item) => ({
        ...item,
        category: typeof item.category === "string" ? item.category : (item as any).category ?? null,
        originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    }));
    const activeSpecials = normalizedItems.filter((item) => item.saleUntil && new Date(item.saleUntil) > new Date());

    const categoryLabelFor = (item: MenuItem) => {
        const raw = typeof item.category === "string" ? item.category.trim() : "";
        return raw.length ? raw : "Main Menu";
    };

    const isSteak = restaurant?.name?.toLowerCase?.().includes("steak 'n shake") || restaurant?.name?.toLowerCase?.().includes("steak n shake");

    const categoryOrder = (() => {
        if (isDhansKitchen) {
            return ["Doubles", "Curry Platters", "Vegan", "Sides", "Drinks", "Dessert", "Main Menu"];
        }
        if (restaurant?.name?.toLowerCase?.().includes("dank burrito")) {
            return ["Burritos", "Bowls", "Quesadillas", "Salads", "Sides", "Kids Meals", "Desserts", "Drinks", "Main Menu"];
        }
        if (restaurant?.name?.toLowerCase?.().includes("pimento")) {
            return ["Appetizers", "Entrees", "Roti", "Sides", "Drinks", "Desserts", "Main Menu"];
        }
        if (restaurant?.name?.toLowerCase?.().includes("krave 489")) {
            return ["Small Plates", "Salads", "Entrees", "Seafood Boil", "Sides", "Desserts", "Kids Cravings", "Main Menu"];
        }
        if (isSteak) {
            return ["Steakburgers", "Hot Dogs", "Chicken", "Salads", "Sides", "Milkshakes", "Desserts", "Drinks", "Kids Meals", "Main Menu"];
        }
        return [];
    })();

    const menuSections = (() => {
        const buckets = new Map<string, MenuItem[]>();
        for (const item of normalizedItems) {
            const inferredLabel = (() => {
                if (!isDhansKitchen) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("doubles")) return "Doubles";
                if (name.includes("curry")) return "Curry Platters";
                if (name.includes("vegan")) return "Vegan";
                return null;
            })();

            const pimentoLabel = (() => {
                if (!restaurant?.name?.toLowerCase?.().includes("pimento")) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("patty") || name.includes("coco bread")) return "Appetizers";
                if (name.includes("roti")) return "Roti";
                if (name.includes("sorrel") || name.includes("ginger beer") || name.includes("juice")) return "Drinks";
                if (name.includes("rice and peas") || name.includes("mac and cheese") || name.includes("cabbage") || name.includes("plantain") || name.includes("festival")) return "Sides";
                return "Entrees";
            })();

            const kraveLabel = (() => {
                if (!restaurant?.name?.toLowerCase?.().includes("krave 489")) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (
                    [
                        "seasonal hummus",
                        "street corn ribs",
                        "burrata",
                        "antipasti skewers",
                        "whipped feta dip",
                        "tuna nacho",
                        "wagyu beef meatballs",
                        "scallops",
                        "mussels",
                        "blood orange ceviche",
                        "sausage and peppers",
                        "crab cakes",
                        "teriyaki shrimp skewers",
                        "crispy calamari",
                    ].some((needle) => name.includes(needle))
                ) {
                    return "Small Plates";
                }
                if (name.includes("watermelon and feta") || name.includes("southern caesar") || name.includes("gardenia") || name.includes("krave cobb")) {
                    return "Salads";
                }
                if (name.includes("boil") || name.startsWith("add ")) {
                    return "Seafood Boil";
                }
                if (
                    name.includes("twice baked sweet potatoes") ||
                    name.includes("rosemary parmesan fries") ||
                    name.includes("lime slaw") ||
                    name.includes("brussel sprouts") ||
                    name.includes("mushroom pilaf") ||
                    name.includes("mashed potatoes") ||
                    name.includes("asparagus") ||
                    name.includes("roasted vegetable medley") ||
                    name.includes("mac and cheese")
                ) {
                    return "Sides";
                }
                if (name.includes("pie") || name.includes("cobbler") || name.includes("bread pudding") || name.includes("cake")) {
                    return "Desserts";
                }
                if (name.startsWith("kids ")) {
                    return "Kids Cravings";
                }
                return "Entrees";
            })();

            const dankLabel = (() => {
                if (!restaurant?.name?.toLowerCase?.().includes("dank burrito")) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;

                const name = String(item.name || "").toLowerCase();

                if (name.includes("quesadilla")) return "Quesadillas";
                if (name.startsWith("kids ")) return "Kids Meals";
                if (
                    name.includes("fried oreos") ||
                    name.includes("funnel fries") ||
                    name.includes("crème brulee") ||
                    name.includes("creme brulee")
                ) {
                    return "Desserts";
                }
                if (
                    name.includes("sweet tea") ||
                    name.includes("unsweet tea") ||
                    name.includes("coke") ||
                    name.includes("sprite") ||
                    name.includes("lemonade") ||
                    name.includes("water")
                ) {
                    return "Drinks";
                }
                if (
                    name.includes("chips") ||
                    name.includes("queso") ||
                    name.includes("salsa") ||
                    name.includes("guacamole") ||
                    name.includes("side")
                ) {
                    return "Sides";
                }
                if (name.includes("salad")) return "Salads";
                if (
                    [
                        "cloud 9",
                        "dank banger",
                        "porky's revenge",
                        "sticky icky",
                        "california dreaming",
                    ].some((needle) => name.includes(needle))
                ) {
                    return "Burritos";
                }
                return "Bowls";
            })();

            const steakLabel = (() => {
                if (!isSteak) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("shake") || name.includes("float") || name.includes("malt")) return "Milkshakes";
                if (name.includes("hot dog") || name.includes("frank") || name.includes("corn dog")) return "Hot Dogs";
                if (name.includes("chicken") || name.includes("nugget") || name.includes("tender")) return "Chicken";
                if (name.includes("salad")) return "Salads";
                if (name.startsWith("kids ") || name.includes("kid's") || name.includes("kids meal")) return "Kids Meals";
                if (name.includes("sundae") || name.includes("pie") || name.includes("banana split") || name.includes("dessert")) return "Desserts";
                if (name.includes("fries") || name.includes("onion rings") || name.includes("chili") || name.includes("side") || name.includes("cheese sauce")) return "Sides";
                if (name.includes("coffee") || name.includes("tea") || name.includes("soda") || name.includes("water") || name.includes("juice") || name.includes("lemonade") || name.includes("drink")) return "Drinks";
                if (name.includes("burger") || name.includes("steakburger") || name.includes("double") || name.includes("triple") || name.includes("single") || name.includes("patty melt") || name.includes("sandwich")) return "Steakburgers";
                return "Steakburgers"; // default for Steak 'n Shake is burgers
            })();

            // Universal fallback: infer from item name when no DB category and no restaurant-specific rule matched
            const universalLabel = (() => {
                if (inferredLabel || pimentoLabel || kraveLabel || dankLabel || steakLabel) return null;
                // Only fires when there's no DB category set
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("shake") || name.includes("smoothie") || name.includes("float") ||
                    name.includes("coffee") || name.includes("tea") || name.includes("lemonade") ||
                    name.includes("juice") || name.includes("soda") || name.includes("water") ||
                    name.includes("beverage") || name.includes("drink") || name.includes("beer") ||
                    name.includes("wine") || name.includes("cocktail") || name.includes("malt"))
                    return "Drinks";
                if (name.includes("fries") || name.includes("onion ring") || name.includes("coleslaw") ||
                    name.includes("mac and cheese") || name.includes("mashed potato") ||
                    name.includes("corn") || name.includes("rice") || name.includes("beans") ||
                    name.includes("breadstick") || name.includes("side"))
                    return "Sides";
                if (name.includes("salad")) return "Salads";
                if (name.includes("cake") || name.includes("pie") || name.includes("brownie") ||
                    name.includes("cookie") || name.includes("ice cream") || name.includes("sundae") ||
                    name.includes("cheesecake") || name.includes("pudding") || name.includes("cobbler") ||
                    name.includes("dessert"))
                    return "Desserts";
                if (name.startsWith("kids ") || name.includes("kid's ") || name.includes("kids meal") ||
                    name.includes("children"))
                    return "Kids Meals";
                if (name.includes("appetizer") || name.includes("starter") || name.includes("sampler") ||
                    name.includes("nachos") || name.includes("wings") || name.includes("mozzarella stick") ||
                    name.includes("egg roll") || name.includes("spring roll") || name.includes("bruschetta"))
                    return "Starters";
                return null; // let categoryLabelFor handle it (uses DB value or "Main Menu")
            })();

            const label = inferredLabel || pimentoLabel || kraveLabel || dankLabel || steakLabel || universalLabel || categoryLabelFor(item);
            if (!buckets.has(label)) buckets.set(label, []);
            buckets.get(label)!.push(item);
        }

        const sortKey = (label: string) => {
            const idx = categoryOrder.indexOf(label);
            if (idx >= 0) return `0_${idx.toString().padStart(3, "0")}_${label.toLowerCase()}`;
            return `1_${label.toLowerCase()}`;
        };

        return Array.from(buckets.entries())
            .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
            .map(([label, sectionItems]) => ({
                label,
                items: sectionItems.sort((a, b) => a.name.localeCompare(b.name)),
            }));
    })();

    const hasCategories =
        menuSections.length > 1 ||
        (menuSections.length === 1 && menuSections[0]?.label !== "Main Menu");

    const fallbackDistanceText = (() => {
        if (!hasCheckoutRoute) return "";
        const toRad = (value: number) => (value * Math.PI) / 180;
        const earthMiles = 3958.8;
        const dLat = toRad(restaurantLat - deliveryLat!);
        const dLng = toRad(restaurantLng - deliveryLng!);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(deliveryLat!)) *
                Math.cos(toRad(restaurantLat)) *
                Math.sin(dLng / 2) ** 2;
        const miles = 2 * earthMiles * Math.asin(Math.sqrt(a));
        if (!Number.isFinite(miles)) return "";
        return `~${miles.toFixed(1)} mi`;
    })();

    const checkoutDistanceText = checkoutDistance || fallbackDistanceText;

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!deliveryAddress) return alert("Please set a delivery address");
        if (deliveryLat === null || deliveryLng === null) {
            return alert("Please select a suggested address so we can route your order accurately.");
        }
        if (deliverySpeed === "SCHEDULED" && !scheduledFor) {
            return alert("Please choose a scheduled delivery time.");
        }
        if (isGift && !giftName.trim()) {
            return alert("Please add the gift recipient's name.");
        }
        setIsSubmitting(true);
        const deliveryPreferenceNote = [
            `Drop-off: ${dropoffPreference}`,
            unit.trim() ? `Unit/Suite: ${unit.trim()}` : "",
            accessCode.trim() ? `Access: ${accessCode.trim()}` : "",
            deliveryInstructions.trim() ? `Notes: ${deliveryInstructions.trim()}` : "",
        ].filter(Boolean).join(" | ");
        const giftPrefix = isGift && giftName
            ? `[GIFT:${JSON.stringify({ recipientName: giftName, recipientPhone: giftPhone, note: giftNote })}] `
            : "";
        const res = await placeOrder(
            restaurant.id,
            cartItems.map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return { id, quantity: qty, price: item?.price || 0 };
            }),
            paymentIntentId,
            deliveryLat || 0,
            deliveryLng || 0,
            deliveryAddress,
            tip,
            giftPrefix + deliveryPreferenceNote,
            redeemPoints ? pointsValue : 0,
            {
                deliverySpeed,
                scheduledFor: deliverySpeed === "SCHEDULED" ? scheduledFor : null,
                deliveryPinAdjusted,
                giftRecipientName: isGift ? giftName.trim() : "",
                giftRecipientPhone: isGift ? giftPhone.trim() : "",
                giftMessage: isGift ? giftNote.trim() : "",
                giftHideReceipt: isGift ? giftHideReceipt : false,
                rewardsPerksSnapshot: {
                    plan: rewardsPlan,
                    estimatedPoints,
                    multiplier: rewardsMultiplier,
                    redeemedPoints: redeemPoints ? pointsValue : 0,
                },
            }
        );
        if (res.success && res.orderId) setPendingOrderId(res.orderId);
        else alert(res.message || "Failed to place order");
        setIsSubmitting(false);
    };

    function to12h(hhmm: string): string {
        const [hStr, mStr] = hhmm.split(':');
        const h = parseInt(hStr, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${mStr} ${period}`;
    }

    function menuAnchor(label: string): string {
        return `menu-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    }

    function changeMenuZoom(direction: -1 | 1) {
        setMenuZoom((current) => {
            const index = MENU_ZOOM_LEVELS.indexOf(current);
            const nextIndex = Math.min(MENU_ZOOM_LEVELS.length - 1, Math.max(0, index + direction));
            return MENU_ZOOM_LEVELS[nextIndex];
        });
    }

    return (
        <div className="menu-body">
            <div className="menu-content-column">
            {pendingOrderId && (
                <OrderConfirmAnimation
                    restaurantName={restaurant.name}
                    onComplete={() => router.push(`/orders/${pendingOrderId}`)}
                />
            )}

            {/* Closed notice */}
            {!isOpen && (
                <div style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    marginBottom: 16,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr)',
                    gap: 10,
                    boxShadow: '0 14px 34px rgba(0,0,0,0.16)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                                Closed right now
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', marginTop: 3, lineHeight: 1.5 }}>
                                You can still browse the menu. Ordering reopens during listed hours.
                            </div>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                            border: '1px solid rgba(249,115,22,0.22)',
                            background: 'rgba(249,115,22,0.08)',
                            color: '#f97316',
                            borderRadius: 999,
                            padding: '7px 10px',
                            fontSize: 10,
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>
                            <Clock3 size={13} />
                            {to12h(openTimeDisplay)} – {to12h(closeTimeDisplay)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.52)', fontSize: 11, lineHeight: 1.5 }}>
                        <MapPin size={13} style={{ color: '#f97316', flexShrink: 0 }} />
                        <span>{restaurantAddressLabel}</span>
                    </div>
                    <div style={{
                        position: 'relative',
                        height: 170,
                        overflow: 'hidden',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(0,0,0,0.18)',
                    }}>
                        <iframe
                            title={`${restaurant.name} location map`}
                            src={restaurantMapSrc}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 0,
                                filter: 'grayscale(0.18) contrast(1.02)',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* GHL Modal */}
            {isGHLOpen && (
                <div className="ghl-modal" onClick={() => setIsGHLOpen(false)}>
                    <div className="ghl-card" onClick={e => e.stopPropagation()}>
                        <div className="ghl-hd">
                            <span style={{ fontWeight: 800 }}>{restaurant.name} Assistant</span>
                            <button onClick={() => setIsGHLOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>Close</button>
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            {ghlLoading && (
                                <div className="ghl-loading">
                                    <div className="ai-dot" style={{ width: '12px', height: '12px' }}></div>
                                    Connecting to GHL Hive...
                                </div>
                            )}
                            <iframe 
                                src={ghlUrl} 
                                className="ghl-frame"
                                onLoad={() => setGHLLoading(false)}
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
            
            <div className={`menu-items menu-zoom-${menuZoom}`}>
                {ghlUrl && (
                    <button type="button" className="ghl-btn !bg-[#f97316] !text-black shadow-lg" onClick={openGHL}>
                        <span style={{ fontSize: '16px' }}>Fast</span> 
                        Order with Fast Assist
                    </button>
                )}
                <div className="menu-list-head">
                    <div>
                        <div className="food-kicker">Menu</div>
                        <h3>Choose your favorites</h3>
                    </div>
                    <div className="menu-view-tools" aria-label="Menu view controls">
                        <span>{items.length} items</span>
                        <div className="menu-zoom-controls">
                            <button
                                type="button"
                                onClick={() => changeMenuZoom(-1)}
                                disabled={menuZoom === "compact"}
                                aria-label="Zoom menu out"
                            >
                                <ZoomOut size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => changeMenuZoom(1)}
                                disabled={menuZoom === "large"}
                                aria-label="Zoom menu in"
                            >
                                <ZoomIn size={15} />
                            </button>
                        </div>
                    </div>
                </div>
                {hasCategories && (
                    <div className="menu-category-nav" aria-label="Menu categories">
                        {activeSpecials.length > 0 && (
                            <a href="#menu-specials" className="menu-category-pill">
                                Specials
                            </a>
                        )}
                        {menuSections.map((section) => (
                            <a key={section.label} href={`#${menuAnchor(section.label)}`} className="menu-category-pill">
                                {section.label}
                            </a>
                        ))}
                    </div>
                )}
                {activeSpecials.length > 0 && (
                    <section id="menu-specials" className="menu-section">
                        <div className="cat" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={16} />
                            Local specials
                        </div>
                        <div className="menu-shelf">
                            {activeSpecials.map(item => (
                                <div key={`special-${item.id}`} className="m-item no-image">
                                    <div className="m-copy">
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            <div className="m-name">{item.name}</div>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                border: "1px solid rgba(249,115,22,.28)",
                                                background: "rgba(249,115,22,.08)",
                                                color: "#f97316",
                                                borderRadius: 999,
                                                padding: "3px 7px",
                                                fontSize: 9,
                                                fontWeight: 900,
                                                letterSpacing: ".1em",
                                                textTransform: "uppercase",
                                            }}>
                                                <Sparkles size={10} /> Special
                                            </span>
                                        </div>
                                        {item.description ? <div className="m-desc">{item.description}</div> : null}
                                    </div>
                                    <div className="m-r">
                                        <span style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                                            {item.originalPrice && item.originalPrice > item.price ? (
                                                <span style={{ color: "#747c78", fontSize: 12, fontWeight: 800, textDecoration: "line-through" }}>
                                                    ${item.originalPrice.toFixed(2)}
                                                </span>
                                            ) : null}
                                            <span className="m-price">${item.price.toFixed(2)}</span>
                                        </span>
                                        <button type="button" className="add-btn" onClick={() => addItem(item.id)} aria-label={`Add ${item.name}`}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {!hasCategories ? <div className="cat">Main Menu</div> : null}
                {menuSections.map((section) => (
                    <section key={section.label} id={menuAnchor(section.label)} className="menu-section">
                        {hasCategories ? <div className="cat">{section.label}</div> : null}
                        <div className="menu-shelf">
                            {section.items.map(item => (
                                <div key={item.id} className="m-item no-image">
                                    <div className="m-copy">
                                        <div className="m-name">{item.name}</div>
                                        {item.description ? <div className="m-desc">{item.description}</div> : null}
                                    </div>
                                    <div className="m-r">
                                        <span className="m-price">${item.price.toFixed(2)}</span>
                                        <button type="button" className="add-btn" onClick={() => addItem(item.id)} aria-label={`Add ${item.name}`}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            </div>

            <div className="cart">
                <div className="cart-hd">Your Order</div>
                <div className="cart-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">Add a few favorites to start your cart.</div>
                    ) : (
                        cartItems.map(([id, qty]) => {
                            const item = items.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div className="ci" key={id}>
                                    <div className="ci-name">{item.name}</div>
                                    <div className="qc">
                                        <button type="button" className="qb" onClick={() => chgQty(id, -1)}>−</button>
                                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{qty}</span>
                                        <button type="button" className="qb" onClick={() => chgQty(id, 1)}>+</button>
                                    </div>
                                    <span className="ci-p">${(item.price * qty).toFixed(2)}</span>
                                    <button
                                        type="button"
                                        className="ci-remove"
                                        aria-label={`Remove ${item.name} from order`}
                                        onClick={() => removeItem(id)}
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-ft" style={{ display: 'block', padding: '20px', borderTop: '1px solid var(--border)' }}>
                        <div className="checkout-clarity-panel" aria-label="Checkout transparency">
                            <div>
                                <ReceiptText size={14} aria-hidden="true" />
                                <span>No surprise fees. Delivery, tax, rewards, and tip are shown before payment.</span>
                            </div>
                            <div>
                                <Route size={14} aria-hidden="true" />
                                <span>Enter a suggested address to preview route distance and ETA.</span>
                            </div>
                            <div>
                                <ShieldCheck size={14} aria-hidden="true" />
                                <span>Orders are paused automatically when the restaurant is closed.</span>
                            </div>
                        </div>
                        <div className="tr"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="tr"><span>Delivery Fee</span><span>$2.99</span></div>
                        <div className="tr"><span>Tax (7%)</span><span>${tax.toFixed(2)}</span></div>
                        {redeemPoints && <div className="tr" style={{ color: 'var(--gold)' }}><span>TruePoints</span><span>-${pointsDiscount.toFixed(2)}</span></div>}
                        <div className="tr big"><span>Total</span><span>${total.toFixed(2)}</span></div>

                        {/* Delivery Timing */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800 }}>Delivery Time</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                                {deliveryOptions.map((option) => {
                                    const Icon = option.icon;
                                    const active = deliverySpeed === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setDeliverySpeed(option.id)}
                                            className="checkout-choice-card"
                                            style={{
                                                minHeight: 88,
                                                padding: '10px 8px',
                                                borderRadius: 12,
                                                border: `1px solid ${active ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                                background: active ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.025)',
                                                color: '#fff',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Icon size={15} color={active ? '#f97316' : 'rgba(255,255,255,0.58)'} aria-hidden="true" />
                                            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 900 }}>{option.label}</div>
                                            <div style={{ marginTop: 3, fontSize: 9, color: 'rgba(255,255,255,0.48)', lineHeight: 1.35 }}>{option.detail}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {deliverySpeed === "SCHEDULED" && (
                                <div style={{ marginTop: 8 }}>
                                    <label style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                                        Delivery Window
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledFor}
                                        min={new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16)}
                                        onChange={e => setScheduledFor(e.target.value)}
                                        style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, padding: '9px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Rewards Preview */}
                        <div style={{
                            marginTop: 16,
                            padding: '12px',
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, rgba(249,115,22,0.09), rgba(255,255,255,0.025))',
                            border: '1px solid rgba(249,115,22,0.18)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(249,115,22,0.13)', display: 'grid', placeItems: 'center', color: '#f97316', flexShrink: 0 }}>
                                        <Star size={15} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>TrueServe Rewards</div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, lineHeight: 1.45 }}>{nextTierText}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 18, fontWeight: 950, color: '#f97316', lineHeight: 1 }}>{estimatedPoints}</div>
                                    <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', color: '#777', textTransform: 'uppercase' }}>pts est.</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 10 }}>
                                {[
                                    { label: 'Basic', value: '1x points' },
                                    { label: 'Plus', value: '1.5x + priority' },
                                    { label: 'Premium', value: '2x + concierge' },
                                ].map((perk) => (
                                    <div key={perk.label} style={{ padding: '8px 7px', borderRadius: 10, background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>{perk.label}</div>
                                        <div style={{ fontSize: 8, color: '#777', marginTop: 2, lineHeight: 1.25 }}>{perk.value}</div>
                                    </div>
                                ))}
                            </div>
                            {!userId && (
                                <Link href={`/login?redirect=/restaurants/${restaurant.id}`} style={{ display: 'inline-flex', marginTop: 10, fontSize: 10, fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Sign in to save rewards
                                </Link>
                            )}
                        </div>

                        {/* Tip Selection */}
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800 }}>Tip your driver</div>
                            <div style={{ fontSize: '10px', color: '#555', marginBottom: '8px' }}>You can also tip after delivery once you've seen your food.</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {[0, 15, 18, 20].map(p => (
                                    <button
                                        key={p}
                                        className={`btn ${tipPct === p ? 'btn-gold' : 'btn-ghost'}`}
                                        style={{ flex: 1, padding: '4px', fontSize: '11px' }}
                                        onClick={() => setTipPct(p)}
                                    >
                                        {p === 0 ? 'Skip' : p + '%'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gift a Meal */}
                        <div style={{ marginTop: '16px' }}>
                            <button
                                type="button"
                                onClick={() => setIsGift(g => !g)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: isGift ? 'rgba(249,115,22,0.07)' : 'transparent',
                                    border: `1px solid ${isGift ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Gift size={16} color={isGift ? '#f97316' : 'rgba(255,255,255,0.65)'} aria-hidden="true" />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: isGift ? '#f97316' : '#fff' }}>Send as a Gift</div>
                                        <div style={{ fontSize: 10, color: '#555' }}>Deliver to someone else with a personal note</div>
                                    </div>
                                </div>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: isGift ? '#f97316' : 'transparent',
                                    border: `2px solid ${isGift ? '#f97316' : '#333'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.15s',
                                }}>
                                    {isGift && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="2,5 4,7.5 8,3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                            </button>

                            {isGift && (
                                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <div>
                                            <label style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Recipient Name</label>
                                            <input
                                                type="text"
                                                placeholder="Jordan Lee"
                                                value={giftName}
                                                onChange={e => setGiftName(e.target.value)}
                                                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Their Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="(555) 000-0000"
                                                value={giftPhone}
                                                onChange={e => setGiftPhone(e.target.value)}
                                                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Personal Note</label>
                                        <textarea
                                            placeholder="Thinking of you. Enjoy your meal."
                                            value={giftNote}
                                            onChange={e => setGiftNote(e.target.value)}
                                            rows={2}
                                            style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#fff', outline: 'none', resize: 'none' }}
                                        />
                                    </div>
                                    <div style={{ fontSize: 10, color: 'rgba(249,115,22,0.7)', fontWeight: 600 }}>
                                        The delivery address below will be where this gift is sent.
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
                                        <input
                                            type="checkbox"
                                            checked={giftHideReceipt}
                                            onChange={(e) => setGiftHideReceipt(e.target.checked)}
                                        />
                                        Hide prices from recipient
                                    </label>
                                </div>
                            )}
                        </div>

                        {userId && truePointsBalance > 0 && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', fontSize: '12px', color: 'var(--t2)' }}>
                                <input
                                    type="checkbox"
                                    checked={redeemPoints}
                                    onChange={(e) => setRedeemPoints(e.target.checked)}
                                />
                                Redeem TruePoints balance (${(truePointsBalance / 100).toFixed(2)} available)
                            </label>
                        )}

                        {/* Address Selection */}
                        {!isSubmitting && (
                            <div style={{ marginTop: '16px' }}>
                                    <AddressInput 
                                        initialAddress={deliveryAddress || ""} 
                                        onAddressSelect={(addr, lat, lng) => {
                                            setDeliveryAddress(addr);
                                            setDeliveryLat(typeof lat === "number" && Number.isFinite(lat) ? lat : null);
                                            setDeliveryLng(typeof lng === "number" && Number.isFinite(lng) ? lng : null);
                                            setBaseDeliveryLat(typeof lat === "number" && Number.isFinite(lat) ? lat : null);
                                            setBaseDeliveryLng(typeof lng === "number" && Number.isFinite(lng) ? lng : null);
                                            setDeliveryPinAdjusted(false);
                                            setCheckoutEta("Calculating...");
                                            setCheckoutDistance("");
                                            try {
                                                const nextAddress = String(addr || "").trim();
                                                if (nextAddress) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.address, nextAddress);
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.address);
                                                }
                                                if (typeof lat === "number" && Number.isFinite(lat)) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lat, String(lat));
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.lat);
                                                }
                                                if (typeof lng === "number" && Number.isFinite(lng)) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lng, String(lng));
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.lng);
                                                }
                                            } catch { }
                                        }}
                                    />
                                    <div style={{
                                        marginTop: 10,
                                        display: 'grid',
                                        gap: 8,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.025)',
                                        borderRadius: 14,
                                        padding: 12,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 900 }}>Saved Delivery Preferences</div>
                                                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>These stay on this device for faster checkout.</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                                            {(["Leave at door", "Hand to me", "Meet outside"] as DropoffPreference[]).map((option) => {
                                                const active = dropoffPreference === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => setDropoffPreference(option)}
                                                        className="checkout-choice-card"
                                                        style={{
                                                            minHeight: 48,
                                                            padding: '9px 7px',
                                                            borderRadius: 10,
                                                            border: `1px solid ${active ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                                            background: active ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.18)',
                                                            color: active ? '#f97316' : '#fff',
                                                            fontSize: 10,
                                                            fontWeight: 900,
                                                            cursor: 'pointer',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <input
                                                type="text"
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                placeholder="Apt, suite, floor"
                                                maxLength={60}
                                                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, padding: '9px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                                            />
                                            <input
                                                type="text"
                                                value={accessCode}
                                                onChange={(e) => setAccessCode(e.target.value)}
                                                placeholder="Gate / call box"
                                                maxLength={80}
                                                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, padding: '9px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <textarea
                                            value={deliveryInstructions}
                                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                                            placeholder="Extra driver notes, side door, business name, allergies handoff note..."
                                            rows={2}
                                            maxLength={240}
                                            style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, padding: '9px 10px', fontSize: 12, color: '#fff', outline: 'none', resize: 'none' }}
                                        />
                                    </div>
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10 grid gap-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(86px, 112px)' }}>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Drop-Off Pin</div>
                                                <div className="text-[11px] font-semibold text-white/70 mt-1 break-words leading-snug">{locationLabel}</div>
                                                {deliveryPinAdjusted ? (
                                                    <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#3ecf6e]">Customer-adjusted pin saved</div>
                                                ) : (
                                                    <div className="mt-1 text-[9px] text-slate-500">Drag the delivery pin or nudge it below before checkout.</div>
                                                )}
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-[#f97316] text-right" style={{ overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                                                {hasCheckoutRoute ? (
                                                    <>
                                                        <div>{`ETA ${checkoutEta}`}</div>
                                                        {checkoutDistanceText ? (
                                                            <div className="mt-1 text-[9px] text-slate-400">{checkoutDistanceText} away</div>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    "Awaiting Address"
                                                )}
                                            </div>
                                        </div>
                                        {hasCheckoutRoute ? (
                                            <MapWithDirections
                                                height={220}
                                                routeOrigin={{ lat: restaurantLat, lng: restaurantLng }}
                                                origin={{ lat: restaurantLat, lng: restaurantLng }}
                                                destination={{ lat: deliveryLat, lng: deliveryLng }}
                                                showDriver={false}
                                                destinationDraggable
                                                onDestinationChange={(next) => {
                                                    setDeliveryLat(next.lat);
                                                    setDeliveryLng(next.lng);
                                                    setDeliveryPinAdjusted(true);
                                                    setCheckoutEta("Calculating...");
                                                    setCheckoutDistance("");
                                                    try {
                                                        localStorage.setItem(DELIVERY_STORAGE_KEYS.lat, String(next.lat));
                                                        localStorage.setItem(DELIVERY_STORAGE_KEYS.lng, String(next.lng));
                                                    } catch { }
                                                }}
                                                onDurationUpdate={setCheckoutEta}
                                                onDistanceUpdate={setCheckoutDistance}
                                            />
                                        ) : (
                                            <div className="h-[220px] px-6 py-6 flex items-center justify-center text-center">
                                                <div className="max-w-[280px]">
                                                    <div className="text-2xl mb-3 opacity-70">Map</div>
                                                    <div className="text-sm font-semibold text-white/70">Select a suggested address</div>
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Choose an address from Google suggestions to preview the route and distance.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {hasCheckoutRoute && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div>
                                                    <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Fine tune pin</div>
                                                    <div style={{ fontSize: 10, color: '#777', marginTop: 2 }}>Small moves help with apartments, offices, and side doors.</div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(3, 28px)', gap: 4 }}>
                                                    {[
                                                        { label: '', row: 1, col: 1 },
                                                        { label: 'N', row: 1, col: 2, dLat: 0.00018, dLng: 0 },
                                                        { label: '', row: 1, col: 3 },
                                                        { label: 'W', row: 2, col: 1, dLat: 0, dLng: -0.00018 },
                                                        { label: 'Reset', row: 2, col: 2, reset: true },
                                                        { label: 'E', row: 2, col: 3, dLat: 0, dLng: 0.00018 },
                                                        { label: '', row: 3, col: 1 },
                                                        { label: 'S', row: 3, col: 2, dLat: -0.00018, dLng: 0 },
                                                        { label: '', row: 3, col: 3 },
                                                    ].map((control, index) => control.label ? (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            aria-label={control.reset ? "Reset delivery pin to selected address" : `Move delivery pin ${control.label}`}
                                                            onClick={() => {
                                                                if (control.reset) {
                                                                    if (baseDeliveryLat !== null && baseDeliveryLng !== null) {
                                                                        setDeliveryLat(baseDeliveryLat);
                                                                        setDeliveryLng(baseDeliveryLng);
                                                                        try {
                                                                            localStorage.setItem(DELIVERY_STORAGE_KEYS.lat, String(baseDeliveryLat));
                                                                            localStorage.setItem(DELIVERY_STORAGE_KEYS.lng, String(baseDeliveryLng));
                                                                        } catch { }
                                                                    }
                                                                    setDeliveryPinAdjusted(false);
                                                                    setCheckoutEta("Calculating...");
                                                                    setCheckoutDistance("");
                                                                    return;
                                                                }
                                                                if (deliveryLat === null || deliveryLng === null) return;
                                                                const nextLat = deliveryLat + (control.dLat || 0);
                                                                const nextLng = deliveryLng + (control.dLng || 0);
                                                                setDeliveryLat(nextLat);
                                                                setDeliveryLng(nextLng);
                                                                setDeliveryPinAdjusted(true);
                                                                setCheckoutEta("Calculating...");
                                                                setCheckoutDistance("");
                                                                try {
                                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lat, String(nextLat));
                                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lng, String(nextLng));
                                                                } catch { }
                                                            }}
                                                            style={{
                                                                gridRow: control.row,
                                                                gridColumn: control.col,
                                                                width: control.reset ? 34 : 28,
                                                                height: 28,
                                                                borderRadius: 8,
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                background: control.reset ? 'rgba(249,115,22,0.11)' : 'rgba(255,255,255,0.055)',
                                                                color: control.reset ? '#f97316' : '#fff',
                                                                fontSize: control.reset ? 7 : 10,
                                                                fontWeight: 900,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {control.label}
                                                        </button>
                                                    ) : <span key={index} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                        )}

                        {!isOpen ? (
                            <div style={{
                                marginTop: '20px',
                                padding: '13px 14px',
                                borderRadius: 12,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.68)',
                                fontWeight: 800,
                            }}>
                                Ordering is paused while this restaurant is closed. Opens at {to12h(openTimeDisplay)}.
                            </div>
                        ) : userId ? (
                            clientSecret ? (
                                <div style={{ marginTop: '20px' }}>
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                        <CheckoutForm totalAmount={total} onSuccess={handlePaymentSuccess} disabled={isSubmitting || !deliveryAddress} />
                                    </Elements>
                                </div>
                            ) : (
                                <div style={{ marginTop: '20px', textAlign: 'center', opacity: 0.5, fontSize: '12px' }}>Preparing secure checkout...</div>
                            )
                        ) : (
                            <Link href={`/login?redirect=/restaurants/${restaurant.id}`} className="co-btn" style={{ textAlign: 'center', display: 'block' }}>Sign In to Order</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
