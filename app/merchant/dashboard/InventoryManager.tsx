"use client";

import { useState } from "react";
import { toggleIngredientStock } from "../actions";

interface InventoryManagerProps {
    restaurantId: string;
    menuItems: any[];
    outOfStockIngredients: string[];
}

export default function InventoryManager({ restaurantId, menuItems, outOfStockIngredients }: InventoryManagerProps) {
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // Flatten all ingredients from menu items and get unique ones
    const allIngredients = Array.from(new Set(
        menuItems.flatMap(item => item.ingredients || [])
    )).sort();

    const handleToggle = async (ingredient: string, isAvailable: boolean) => {
        setIsUpdating(ingredient);
        try {
            await toggleIngredientStock(restaurantId, ingredient, isAvailable);
        } catch (e) {
            alert("Failed to update ingredient stock.");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="card bg-white/5 border-white/10 p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <span className="text-3xl"></span> Kitchen Inventory
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Smart dependency tracking for active menu items</p>
                </div>
                {outOfStockIngredients.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {outOfStockIngredients.length} Ingredients Out
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allIngredients.map((ingredient) => {
                    const isOutOfStock = outOfStockIngredients.includes(ingredient.toLowerCase());
                    return (
                        <button
                            key={ingredient}
                            disabled={isUpdating === ingredient}
                            onClick={() => handleToggle(ingredient, isOutOfStock)}
                            className={`group relative p-4 rounded-2xl border transition-all text-center ${
                                isOutOfStock 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 opacity-60' 
                                : 'bg-white/5 border-white/5 text-white hover:border-emerald-500/40 hover:bg-emerald-500/5'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                                {ingredient}
                            </span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">
                                {isOutOfStock ? "Sold Out" : "In Stock"}
                            </span>
                            {isUpdating === ingredient && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>
                    );
                })}

                {allIngredients.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-slate-500 italic text-sm">Add ingredients to your menu items to enable inventory sync.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <p className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                    <span className="text-lg"></span>
                    Marking an ingredient as "Sold Out" will automatically highlight affected items on your menu and notify customers before they order.
                </p>
            </div>
        </div>
    );
}
