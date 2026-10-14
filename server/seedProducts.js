import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

export const sampleProducts = [
    // --- Electronics ---
    {
        name: "Wireless Noise-Canceling Headphones",
        description: "Over-ear Bluetooth headphones with active noise cancellation, deep bass, and up to 30 hours of battery life.",
        price: 129.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        stock: 25
    },
    {
        name: "Mechanical Gaming Keyboard RGB",
        description: "Compact mechanical keyboard featuring tactile blue switches, customizable RGB backlighting, and anti-ghosting keys.",
        price: 89.50,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        stock: 18
    },
    {
        name: "Ultra-Slim Smart Watch",
        description: "Fitness smartwatch with AMOLED touch display, heart rate monitor, sleep tracking, and 5ATM water resistance.",
        price: 159.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        stock: 14
    },

    // --- Fashion ---
    {
        name: "Classic Denim Jacket",
        description: "Timeless trucker-style denim jacket crafted from 100% premium cotton with durable button closures.",
        price: 69.99,
        category: "Fashion",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/1980s_blue_denim_jacket%2C_Finland_%E2%80%93_01.jpg",
        stock: 20
    },
    {
        name: "Urban Streetwear Sneakers",
        description: "Lightweight, breathable lifestyle sneakers designed for all-day comfort and modern urban aesthetics.",
        price: 84.99,
        category: "Fashion",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Air_Jordan_1_Banned.jpg",
        stock: 30
    },
    {
        name: "Polarized Aviator Sunglasses",
        description: "Classic aviator sunglasses with UV400 polarized protective lenses and lightweight stainless steel frames.",
        price: 39.50,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
        stock: 15
    },

    // --- Books ---
    {
        name: "JavaScript: The Definitive Guide",
        description: "The master guide to modern JavaScript, covering ES2020+ standards, web APIs, and full-stack patterns.",
        price: 39.99,
        category: "Books",
        image: "https://covers.openlibrary.org/b/isbn/9781491952023-L.jpg",
        stock: 22
    },
    {
        name: "Atomic Habits by James Clear",
        description: "An easy and proven way to build good habits and break bad ones through tiny, compounding daily improvements.",
        price: 21.99,
        category: "Books",
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        stock: 35
    },
    {
        name: "Clean Code: Agile Software Craftsmanship",
        description: "A legendary handbook on writing cleaner, readable, maintainable, and refactor-ready code.",
        price: 44.50,
        category: "Books",
        image: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
        stock: 12
    },

    // --- Home ---
    {
        name: "Handcrafted Ceramic Mug Set",
        description: "Set of 4 artisan ceramic coffee mugs with matte glaze finish, heat-resistant and dishwasher safe.",
        price: 29.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        stock: 16
    },
    {
        name: "Minimalist Wooden Desk Lamp",
        description: "Scandinavian-inspired adjustable LED desk lamp with solid oak wood base and warm dimmable illumination.",
        price: 49.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
        stock: 10
    },
    {
        name: "Ultrasonic Aroma Diffuser",
        description: "300ml quiet ultrasonic essential oil diffuser with 7 ambient color LED lights and auto shut-off.",
        price: 34.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
        stock: 8
    }
];

export async function seedProducts() {
    try {
        if (!process.env.dburl) {
            throw new Error("Missing dburl environment variable in .env");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.dburl);
        console.log("Connected to MongoDB successfully.");

        let addedCount = 0;
        let skippedCount = 0;

        for (const item of sampleProducts) {
            const existing = await Product.findOne({ name: item.name });
            if (!existing) {
                await Product.create(item);
                console.log(`[CREATED] ${item.name} (${item.category})`);
                addedCount++;
            } else {
                console.log(`[EXISTS]  ${item.name} (${item.category})`);
                skippedCount++;
            }
        }

        console.log(`\nSeed summary: Added ${addedCount} products. Skipped ${skippedCount} existing products.`);
        const total = await Product.countDocuments();
        console.log(`Total products now in database: ${total}`);

        return { addedCount, skippedCount, total };
    } catch (error) {
        console.error("Error seeding products:", error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

// Execute if run directly from CLI
if (process.argv[1]?.endsWith("seedProducts.js")) {
    seedProducts()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
