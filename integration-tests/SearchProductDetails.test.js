import mongoose from "mongoose";
import supertest from 'supertest';
import app from '../server.js'; // Import the Express app from server.js
import products from '../test-db-utils/sample-data/sampleProducts.js';
import categories from '../test-db-utils/sample-data/sampleCategories.js';
import Product from '../models/productModel.js';
import Categories from '../models/categoryModel.js';

beforeAll(async () => {
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    await Categories.insertMany(categories);
    for (let product of products) {
        await Categories
            .findOne({ slug: product.category })
            .then(category => {
                product.category = category.id
            });
    }
    await Product.insertMany(products);
});

afterAll(async () => {
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.close();
});

describe('Search Product Details Integration Tests', () => {
    it('should allow a user to get all of the products in the database', async () => {
        const jeansProduct = {
            _id: "66db4280db0119d9234b27fb",
            category: "66db427fdb0119d9234b27ee",
            createdAt: "2024-09-06T17:57:20.029Z",
            description: "Classic denim jeans",
            name: "Jeans",
            price: 49.99,
            quantity: 75,
            shipping: true,
            slug: "jeans",
            updatedAt: "2024-09-06T17:57:20.029Z"
        }

        const response = await supertest(app)
            .get('/api/v1/product/get-product')
            .expect(200);
        const responseProducts = response.body.products;

        expect(response.body.success).toBe(true);
        expect(responseProducts.length).toBe(products.length);

        const responseJeansProduct = responseProducts.filter(
            responseProduct => responseProduct.name === jeansProduct.name)[0];

        // Check that the response jeans product matches the database jeans product.
        const databaseJeansProduct = await Product.findOne({ slug: jeansProduct.slug });
        expect(responseJeansProduct.name).toBe(databaseJeansProduct.name);
        expect(responseJeansProduct.description).toBe(databaseJeansProduct.description);
        expect(responseJeansProduct.price).toBe(databaseJeansProduct.price);
    });

    it('should allow a user to get a specific product from the database', async () => {
        const jeansProduct = {
            _id: "66db4280db0119d9234b27fb",
            category: "66db427fdb0119d9234b27ee",
            createdAt: "2024-09-06T17:57:20.029Z",
            description: "Classic denim jeans",
            name: "Jeans",
            price: 49.99,
            quantity: 75,
            shipping: true,
            slug: "jeans",
            updatedAt: "2024-09-06T17:57:20.029Z"
        }

        const response = await supertest(app)
            .get(`/api/v1/product/get-product/${jeansProduct.slug}`)
            .expect(200);
        const responseProduct = response.body.product;

        expect(response.body.success).toBe(true);

        // Check that the response product matches the database jeans product.
        const databaseJeansProduct = await Product.findOne({ slug: jeansProduct.slug });
        expect(responseProduct.name).toBe(databaseJeansProduct.name);
        expect(responseProduct.description).toBe(databaseJeansProduct.description);
        expect(responseProduct.price).toBe(databaseJeansProduct.price);
    });

    it('should allow a user to search for a product by name and get results from the database', async () => {
        const jeansProduct = {
            _id: "66db4280db0119d9234b27fb",
            category: "66db427fdb0119d9234b27ee",
            createdAt: "2024-09-06T17:57:20.029Z",
            description: "Classic denim jeans",
            name: "Jeans",
            price: 49.99,
            quantity: 75,
            shipping: true,
            slug: "jeans",
            updatedAt: "2024-09-06T17:57:20.029Z"
        }

        const response = await supertest(app)
            .get(`/api/v1/product/search/${jeansProduct.name}`)
            .expect(200);
        const responseJeansProduct = response.body[0];

        expect(response.body.length).toBe(1);

        // Check that the response search product matches the database jeans product.
        const databaseJeansProduct = await Product.findOne({ slug: jeansProduct.slug });
        expect(responseJeansProduct.name).toBe(databaseJeansProduct.name);
        expect(responseJeansProduct.description).toBe(databaseJeansProduct.description);
        expect(responseJeansProduct.price).toBe(databaseJeansProduct.price);
    });

    it('should allow a user to search for a product by description and get results from the database', async () => {
        const jeansProduct = {
            _id: "66db4280db0119d9234b27fb",
            category: "66db427fdb0119d9234b27ee",
            createdAt: "2024-09-06T17:57:20.029Z",
            description: "Classic denim jeans",
            name: "Jeans",
            price: 49.99,
            quantity: 75,
            shipping: true,
            slug: "jeans",
            updatedAt: "2024-09-06T17:57:20.029Z"
        }

        const response = await supertest(app)
            .get(`/api/v1/product/search/${jeansProduct.description}`)
            .expect(200);
        const responseJeansProduct = response.body[0];

        expect(response.body.length).toBe(1);

        // Check that the response search product matches the database jeans product.
        const databaseJeansProduct = await Product.findOne({ slug: jeansProduct.slug });
        expect(responseJeansProduct.name).toBe(databaseJeansProduct.name);
        expect(responseJeansProduct.description).toBe(databaseJeansProduct.description);
        expect(responseJeansProduct.price).toBe(databaseJeansProduct.price);
    });

    it('should allow a user to find similar products to the current product', async () => {
        const jeansProduct = {
            _id: "66db4280db0119d9234b27fb",
            category: "66db427fdb0119d9234b27ee",
            createdAt: "2024-09-06T17:57:20.029Z",
            description: "Classic denim jeans",
            name: "Jeans",
            price: 49.99,
            quantity: 75,
            shipping: true,
            slug: "jeans",
            updatedAt: "2024-09-06T17:57:20.029Z"
        }

        const tshirtProduct = {
            _id: "66db427fdb0119d9234b27f7",
            category: {
                _id: "66db427fdb0119d9234b27ee",
                name: "Clothing",
                slug: "clothing"
            },
            createdAt: "2024-09-06T17:57:19.984Z",
            description: "A comfortable cotton t-shirt",
            name: "T-shirt",
            price: 19.99,
            quantity: 100,
            shipping: true,
            slug: "t-shirt",
            updatedAt: "2024-09-06T17:57:19.984Z"
        };

        const databaseJeansProduct = await Product.findOne({ slug: jeansProduct.slug });
        const databaseTshirtProduct = await Product.findOne({ slug: tshirtProduct.slug });
        const databaseClothingCategory = await Categories.findOne({ slug: 'clothing' });

        const response = await supertest(app)
            .get(`/api/v1/product/related-product/${databaseJeansProduct.id}/${databaseClothingCategory.id}`)
            .expect(200);
        const responseProducts = response.body.products;
        const responseTshirtProduct = responseProducts[0];

        expect(response.body.success).toBe(true);
        expect(responseProducts.length).toBe(1);

        // Check that the response t-shirt product matches the database t-shirt product.
        expect(responseTshirtProduct.name).toBe(databaseTshirtProduct.name);
        expect(responseTshirtProduct.description).toBe(databaseTshirtProduct.description);
        expect(responseTshirtProduct.price).toBe(databaseTshirtProduct.price);
    });
});
