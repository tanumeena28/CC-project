require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce';

const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Beauty'];

const generateProducts = (num) => {
    const products = [];
    for (let i = 1; i <= num; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        products.push({
            name: `Product ${i} - ${category}`,
            description: `This is a high quality description for product ${i} in the ${category} category. It has many great features.`,
            price: Number((Math.random() * 500 + 10).toFixed(2)),
            stock: Math.floor(Math.random() * 1000) + 10,
            category: category
        });
    }
    return products;
};

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        
        console.log('Clearing existing products...');
        await Product.deleteMany({});
        
        console.log('Generating 5000 products...');
        const products = generateProducts(5000);
        
        console.log('Inserting products into database...');
        await Product.insertMany(products);
        
        console.log('Successfully seeded database with 5000 products');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedDatabase();
