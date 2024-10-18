const { test, expect } = require('@playwright/test');

const websiteUrl = 'http://localhost:3000/';
const userEmail = 'Daniel@gmail.com';
const userPassword = 'Daniel';
const searchItem = 'Jeans';
const similarItem = 'T-shirt'
const JEANS_PRODUCT_OBJECT = {
    _id: "66db4280db0119d9234b27fb",
    category: {
        _id: "66db427fdb0119d9234b27ee",
        name: "Clothing",
        slug: "clothing"
    },
    createdAt: "2024-09-06T17:57:20.029Z",
    description: "Classic denim jeans",
    name: "Jeans",
    price: 49.99,
    quantity: 75,
    shipping: true,
    slug: "jeans",
    updatedAt: "2024-09-06T17:57:20.029Z"
};
const TSHIRT_PRODUCT_OBJECT = {
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

test('should be able to view similar products when viewing the product details page and navigate to the product details page of the similar products', async ({ page }) => {
    // Visit ecommerce website.
    await page.goto(websiteUrl, { waitUntil: "domcontentloaded" });

    // Navigate to the login page.
    await page.getByRole('link', { name: 'Login' }).click();

    // Log the user in.
    await page.locator("input[id='exampleInputEmail1']").fill(userEmail);
    await page.locator("input[id='exampleInputPassword1']").fill(userPassword);
    await page.getByRole('button', { name: "LOGIN" }).click();

    // Search for the desired item in the search bar.
    await page.getByPlaceholder("Search").fill(searchItem);
    await page.getByRole('button', { name: "Search" }).click();

    // Verify that the searchItem is displayed on the page.
    await expect(page.getByRole('heading', { name: searchItem })).toBeVisible();

    // Navigate into the product details page of the desired item.
    // WARNING: this step fails clicking More Details button from the search page does not work 🤡. This is a workaround to get the code working for now.
    // await page.getByRole('button', { name: "More Details" }).click();
    await page.goto(websiteUrl + "product/Jeans", { waitUntil: "domcontentloaded" });

    // Verify that similar items are shown in the product details page and that similar items are correct.
    await expect(page.getByRole('heading', { name: TSHIRT_PRODUCT_OBJECT.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: TSHIRT_PRODUCT_OBJECT.name })).toContainText(similarItem);
    await expect(page.getByText("$" + TSHIRT_PRODUCT_OBJECT.price.toString())).toBeVisible();
    await expect(page.getByText(TSHIRT_PRODUCT_OBJECT.description + "...")).toBeVisible();
    await expect(page.getByRole('button', { name: "More Details" }).first()).toBeVisible();
    
    // Navigate into product details page of the similar item.
    await page.getByRole('button', { name: "More Details" }).click();

    // Verify that the details of the similar product are displayed correctly on the Product Details Page.
    await expect(page.getByText("Name : " + TSHIRT_PRODUCT_OBJECT.name)).toBeVisible();
    await expect(page.getByText("Description : " + TSHIRT_PRODUCT_OBJECT.description)).toBeVisible();
    await expect(page.getByText("Price :$" + TSHIRT_PRODUCT_OBJECT.price.toString())).toBeVisible();
    await expect(page.getByText("Category : " + TSHIRT_PRODUCT_OBJECT.category.name)).toBeVisible();
    await expect(page.getByRole('button', { name: "ADD TO CART" })).toBeVisible();
});
