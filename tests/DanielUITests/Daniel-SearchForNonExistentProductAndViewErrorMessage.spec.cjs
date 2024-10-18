const { test, expect } = require('@playwright/test');

const websiteUrl = 'http://localhost:3000/';
const userEmail = 'Daniel@gmail.com';
const userPassword = 'Daniel';
const searchItem = 'this is not a real object';
const noSearchResultsMessage = "No Products Found";

test('should be able to search for a non-existent product and be shown an error message indicating that there are no matching products', async ({ page }) => {
    // Visit ecommerce website.
    await page.goto(websiteUrl, { waitUntil: "domcontentloaded" });

    // Navigate to the login page.
    await page.getByRole('link', { name: 'Login' }).click();

    // Log the user in.
    await page.locator("input[id='exampleInputEmail1']").fill(userEmail);
    await page.locator("input[id='exampleInputPassword1']").fill(userPassword);
    await page.getByRole('button', { name: "LOGIN" }).click();

    // Search for the nonexistent item in the search bar.
    await page.getByPlaceholder("Search").fill(searchItem);
    await page.getByRole('button', { name: "Search" }).click();

    // Verify that the search page displays the error message that there are no products available which match the search criteria.
    await expect(page.getByText(noSearchResultsMessage)).toBeVisible();
});
