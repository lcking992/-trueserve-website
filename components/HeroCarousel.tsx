"use client";

import { useState, useEffect } from "react";

const images = [
    "/hero-pizza.png",
    "/hero-burger.png",
    "/hero-sushi.png",
    "/barneys_club_sandwich.png",
    "/snappy_pork_chop.png",
];

export default function HeroCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full aspect-square md:aspect-auto md:h-full overflow-hidden transition-all duration-700 group">
            {images.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt="Delicious Food"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"
                        }`}
                />
            ))}
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
    );
}
