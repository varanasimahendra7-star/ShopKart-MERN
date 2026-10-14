import mongoose from "mongoose";
import Product from "../models/product.model.js";

// @desc    Create a new product
// @route   POST /products
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Check for missing required fields
        if (
            name === undefined || name === null || String(name).trim() === "" ||
            description === undefined || description === null || String(description).trim() === "" ||
            price === undefined || price === null || price === "" ||
            category === undefined || category === null || String(category).trim() === "" ||
            image === undefined || image === null || String(image).trim() === "" ||
            stock === undefined || stock === null || stock === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, image, stock) are required"
            });
        }

        // Validate price (must be a number greater than 0)
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number greater than 0"
            });
        }

        // Validate stock (must be a non-negative integer >= 0)
        const numStock = Number(stock);
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            });
        }

        const newProduct = await Product.create({
            name: String(name).trim(),
            description: String(description).trim(),
            price: numPrice,
            category: String(category).trim(),
            image: String(image).trim(),
            stock: numStock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get all products with optional search and category filter
// @route   GET /products
export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        // Case-insensitive search on product name
        if (search && search.trim() !== "") {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = { $regex: escapedSearch, $options: "i" };
        }

        // Case-insensitive exact match on category (ignoring 'all' / 'all categories')
        if (
            category &&
            category.trim() !== "" &&
            category.toLowerCase() !== "all" &&
            category.toLowerCase() !== "all categories"
        ) {
            const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.category = { $regex: new RegExp(`^${escapedCategory}$`, "i") };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get single product by ID
// @route   GET /products/:id
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
