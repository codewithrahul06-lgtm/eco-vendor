const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./model/user");
const Product = require("./model/products");
const Order = require("./model/order");

mongoose.connect("mongodb://127.0.0.1:27017/shopnest-mern")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // 🔐 Hash password properly
        const hashedPassword = await bcrypt.hash("123456", 10);
        const adminPassword = await bcrypt.hash("admin123", 10);

        // 👤 USERS
        const users = await User.insertMany([
            {
                name: "Ram Sharma",
                email: "ram@example.com",
                password: hashedPassword,
                role: "user",
                verified: true
            },
            {
                name: "Sita Karki",
                email: "sita@example.com",
                password: hashedPassword,
                role: "user",
                verified: true
            },
            {
                name: "Admin",
                email: "admin@example.com",
                password: adminPassword,
                role: "admin",
                verified: true
            }
        ]);

        // 🛍️ PRODUCTS
        const products = await Product.insertMany([
            {
                name: "Laptop",
                description: "High performance laptop",
                price: 1200,
                category: "Electronics",
                stock: 10,
                imageUrl: "https://res.cloudinary.com/demo/image/upload/v1690000000/laptop.jpg",
                rating: 4.5,
                numReviews: 10
            },
            {
                name: "Smartphone",
                description: "Latest Android phone",
                price: 600,
                category: "Electronics",
                stock: 20,
                imageUrl: "https://res.cloudinary.com/demo/image/upload/v1690000000/phone.jpg",
                rating: 4.2,
                numReviews: 8
            },
            {
                name: "Headphones",
                description: "Noise cancelling headphones",
                price: 150,
                category: "Accessories",
                stock: 30,
                imageUrl: "https://res.cloudinary.com/demo/image/upload/v1690000000/headphones.jpg",
                rating: 4.0,
                numReviews: 5
            },
            {
                name: "Shoes",
                description: "Running shoes",
                price: 80,
                category: "Fashion",
                stock: 25,
                imageUrl: "https://res.cloudinary.com/demo/image/upload/v1690000000/shoes.jpg",
                rating: 4.3,
                numReviews: 6
            }
        ]);

        // 📦 ORDERS
        await Order.insertMany([
            {
                user: users[0]._id,
                items: [
                    {
                        productId: products[0]._id,
                        qty: 1,
                        price: products[0].price
                    }
                ],
                totalAmount: products[0].price,
                address: {
                    fullname: "Ram Sharma",
                    street: "Kathmandu Street 1",
                    city: "Kathmandu",
                    postalCode: "44600",
                    country: "Nepal"
                },
                paymentId: "PAY123456",
                status: "delivered"
            },
            {
                user: users[1]._id,
                items: [
                    {
                        productId: products[1]._id,
                        qty: 1,
                        price: products[1].price
                    },
                    {
                        productId: products[2]._id,
                        qty: 2,
                        price: products[2].price
                    }
                ],
                totalAmount: products[1].price + (products[2].price * 2),
                address: {
                    fullname: "Sita Karki",
                    street: "Pokhara Street 5",
                    city: "Pokhara",
                    postalCode: "33700",
                    country: "Nepal"
                },
                paymentId: "PAY789456",
                status: "shipped"
            }
        ]);

        console.log("✅ Seed data inserted successfully!");
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();