const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route GET /api/products
// @desc Get all products (with pagination, filtering, search, sorting)
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            search, 
            sortBy = 'createdAt', 
            order = 'desc' 
        } = req.query;

        const query = {};

        // Filtering
        if (category) {
            query.category = category;
        }

        // Searching (uses text index)
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        
        // Define sorting logic, default -1 for desc
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const products = await Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            data: products,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/products
// @desc Create a new product (mock admin route, unprotected for simplicity)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
