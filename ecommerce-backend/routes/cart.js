const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All cart routes are protected
router.use(authMiddleware);

// @route GET /api/cart
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
        if (!cart) {
            cart = { items: [] }; // return empty cart if not found
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/cart
// @desc Add or update item in cart
router.post('/', async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity == null || quantity < 1) {
            return res.status(400).json({ error: 'Invalid productId or quantity' });
        }

        // Verify product exists and has stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity }] });
        } else {
            // Check if product already in cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        cart = await cart.populate('items.productId');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route DELETE /api/cart
router.delete('/', async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.userId });
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
