import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import categories from "./sample-data/sampleCategories.js";
import products from "./sample-data/sampleProducts.js";
import { getSampleUsers } from "./sample-data/sampleUsers.js";

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image. Status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const data = await response.arrayBuffer();

    return {
      data: Buffer.from(data),
      contentType: contentType,
    };
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

export const populateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_TEST_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = new Map(
      createdCategories.map((cat) => [cat.name, cat._id])
    );

    const [createdUsers] = await getSampleUsers();
    await User.insertMany(createdUsers);

    // const createdProducts = await Promise.all(products.map(async (product) => {
    //   const categoryId = categoryMap.get(product.category);
    //   if (!categoryId) {
    //     throw new Error(`Category not found for product: ${product.name}`);
    //   }

    //   const photo = await downloadImage(product.imageUrl);
    //   const newProduct = new Product({
    //     ...product,
    //     category: categoryId,
    //     photo: photo || { data: Buffer.alloc(0), contentType: 'image/jpeg' },
    //   });
    //   return await newProduct.save();
    // }));

    const createdProducts = [];
    const sortedProducts = products.sort((a, b) =>
      b.name.localeCompare(a.name)
    );

    console.log(sortedProducts.map((prod) => prod.name));

    for (var i = 0; i < products.length; i++) {
      const product = sortedProducts[i];
      const categoryId = categoryMap.get(product.category);
      if (!categoryId) {
        throw new Error(`Category not found for product: ${product.name}`);
      }

      const photo = await downloadImage(product.imageUrl);
      const newProduct = new Product({
        ...product,
        category: categoryId,
        photo: photo || { data: Buffer.alloc(0), contentType: "image/jpeg" },
      });
      createdProducts.push(await newProduct.save());
    }

    const productMap = new Map(
      createdProducts.map((prod) => [prod.name, prod._id])
    );

    await Promise.all(
      orders.map(async (order) => {
        const buyerEmail = order.buyer;
        const buyerId = userMap.get(buyerEmail);
        if (!buyerId) {
          throw new Error(`Buyer not found for email: ${buyerEmail}`);
        }

        const productIds = order.productNames
          .map((name) => productMap.get(name))
          .filter((id) => id);
        if (productIds.length === 0) {
          throw new Error(
            `No valid products found for order with Transaction ID: ${order.payment.transactionId}`
          );
        }

        const newOrder = new Order({
          ...order,
          buyer: buyerId,
          products: productIds,
        });

        return await newOrder.save();
      })
    );

    console.log("Database population completed successfully.");
  } catch (error) {
    console.error("Error during database population:", error);
  } finally {
    await mongoose.disconnect();
  }
};
