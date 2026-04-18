const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// @route POST /api/orders
// @desc Checkout cart and create order
router.post('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (let item of cart.items) {
            if (!item.productId) continue; // If product was deleted but still in cart
            
            const product = item.productId;
            
            if (product.stock < item.quantity) {
                 return res.status(400).json({ error: `Not enough stock for ${product.name}` });
            }
            
            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            orderItems.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;
        }

        const order = new Order({
            userId: req.user.userId,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'Completed' // Directly complete for simplicity
        });

        await order.save();
        
        // Clear cart after successful checkout
        await Cart.findOneAndDelete({ userId: req.user.userId });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/orders
// @desc Get user orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
